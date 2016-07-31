<?php
class ZTSoftware_MagePDV_Model_Api extends Mage_Api_Model_Resource_Abstract
{        
		public function productList()
        {
        	$retArray = array();
        	$products = Mage::getModel('catalog/product')->getCollection();

        	foreach ($products as $prod) {
        		$product = Mage::getModel('catalog/product')->load($prod->getId());

        		$retArrayTmp = array(
		                "product_id" => $product->getId(),
		                "sku" => $product->getData('codigobarra'), //$product->getSku(),
		                "name" => $product->getName(),
		                "price" => $product->getPrice(),
		                "stock" => $product->getStockItem()->getQty(),
		                "image1" => $product->getImageUrl(),
		                "image2" => $product->getImageUrl(),
		                "cod_barras" => $product->getData('codigobarra'),
		                "group_price" => $product->getData('customer_groups_price')
        			);

        		array_push($retArray, $retArrayTmp);
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

				$taxvat = ($customer->getData('tipopessoa') == 'pj') ? $customer->getData('cnpj') : $customer->getData('Cpf');
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
}