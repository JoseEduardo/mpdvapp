<?php
class ZTSoftware_MagePDV_Model_Api extends Mage_Api_Model_Resource_Abstract
{        
		public function productList()
        {
        	$retArray = array();
        	$products = Mage::getModel('catalog/product')->getCollection();

        	foreach ($products as $prod) {
        		$product = Mage::getModel('catalog/product')->load($prod->getId());
        		if( $product->getStatus() == '1' ){
  	                $url = "";
		            $_image = $product->getMediaGalleryImages();
		            if (count( $_image ) > 0) {
		               	$_image = $_image->getFirstItem();
		              	$url = $_image->getData('url');
		            }               
              
	        		$retArrayTmp = array(
			                "product_id" => $product->getId(),
			                "sku" => $product->getSku(),
			                "cod_barra" => $product->getData('codigobarra'),
			                "name" => $product->getName(),
			                "price" => $product->getPrice(),
			                "stock" => $product->getStockItem()->getQty(),
			                "image1" => $url,
			                "image2" => $url,
			                "cod_barras" => $product->getData('codigobarra'),
			                "group_price" => $product->getData('customer_groups_price')
	        			);

	        		array_push($retArray, $retArrayTmp);
        		}
        	}

        	return $retArray;
        }        
		public function customerList()
        {
 			$collection = Mage::getModel('customer/customer')
                  ->getCollection()
                  ->addAttributeToSelect('*');

			$result = array();
		    foreach ($collection as $cust) {
		    	$customer = Mage::getModel('customer/customer')->load($cust->getId());

		    	$customerAddressId = $customer->getData('default_shipping');
				$address = Mage::getModel('customer/address')->load($customerAddressId);

				$addressRet = array(
		                "street" => implode(" ", $address->getStreet()),
    	                "region" => $address->getRegion(),
	                    "customer_address_id" => $customerAddressId
					);

				$taxvat = ($customer->getData('tipopessoa') == 'pj') ? $customer->getData('cnpj') : $customer->getData('cpf');
		    	$retArrayTmp = array(
			            "firstname" => $customer->getFirstname(),
			            "lastname" => $customer->getLastname(),
			            "customer_id" => $customer->getId(),
			            "taxvat" => $taxvat,            
			            "email" => $customer->getEmail(),
			            "address" => $addressRet,
			            "group_id" => $customer->getData('group_id')
        			);

        		array_push($result, $retArrayTmp);
		    }

    		return $result;
        }
        public function customerinfo($data){
			$customer = Mage::getModel('customer/customer')
            ->getCollection()
            ->addAttributeToSelect('*')
            ->addAttributeToFilter('email', $data['email'] )
            ->getFirstItem();

            if( $customer->getId() == null ){
				$customer = Mage::getModel("customer/customer");
				$customer   ->setWebsiteId(Mage::getModel('core/store')->load($data['store_id'])->getWebsiteId())
				            ->setStoreId($data['store_id'])
				            ->setFirstname($data['firstname'])
				            ->setLastname($data['lastname'])
				            ->setEmail($data['email'])
				            ->setGroupId($data['group_id'])
				            ->setPassword('999999');

				$customer->setData('tipopessoa', $data['type_pess']);
				if(	$data['type_pess'] == 'pf' ){
					$customer->setData('cpf', $data['cpf']);
				}else{
					$customer->setData('cnpj', $data['cnpj']);
				}

				$customer->save();

				$_custom_address = array (
				    'firstname' => $data['firstname'],
				    'lastname' => $data['lastname'],
				    'street' => array (
				        '0' => $data['street'],
				        '1' => $data['number'],
						'2' => $data['comment'],
				        '3' => $data['neighborhood'],
				    ),
				    'city' => $data['city'],
				    'region_id' => '',
				    'region' => $data['region'],
				    'postcode' => $data['cep'],
				    'country_id' => 'BR',
				    'telephone' => $data['tel']
				);
				$customAddress = Mage::getModel('customer/address');
				$customAddress->setData($_custom_address)
				            ->setCustomerId($customer->getData('entity_id'))
				            ->setIsDefaultBilling('1')
				            ->setIsDefaultShipping('1')
				            ->setSaveInAddressBook('1');

				$customAddress->save();

				return array('ID' => $customer->getData('entity_id'), 'ADDRESS_ID' => $customAddress->getData('entity_id') );
            }else{
            	$customer = Mage::getModel('customer/customer')->load($customer->getId());
            	return array('ID' => $customer->getId(), 'ADDRESS_ID' => $customer->getData('default_shipping') );
            }
        }
        public function customergrouplist(){
			$customerGroup = Mage::getModel('customer/group')->getCollection();

			return $customerGroup->getData();
        }
}
