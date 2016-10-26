package com.appsee.cordova;

import java.io.InvalidObjectException;
import java.util.HashMap;
import java.util.Iterator;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import android.util.Log;

public class Appsee extends CordovaPlugin
{
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException
    {
        try
        {
            String result = "OK";

            if (action.equals("start"))
            {

                String apiKey = args.getString(0);
                com.appsee.Appsee.appendSDKType("pg");
                com.appsee.Appsee.setSkipStartValidation(true);
                com.appsee.Appsee.start(apiKey);
            }
            
            if (action.equals("stop"))
            {
                com.appsee.Appsee.stop();
            }
            
            if (action.equals("stopAndUpload"))
            {
                com.appsee.Appsee.stopAndUpload();
            }
            
            if (action.equals("pause"))
            {
                com.appsee.Appsee.pause();
            }
            
            if (action.equals("resume"))
            {
                com.appsee.Appsee.resume();
            }
            
            if (action.equals("setUserId"))
            {
                String userId = args.getString(0);
                com.appsee.Appsee.setUserId(userId);
            }
            
            if (action.equals("setLocation"))
            {
                double latitude = args.getDouble(0);
                double longitude = args.getDouble(1);
                double horizontalAccuracy = args.getDouble(2);
                double verticalAccuracy = args.getDouble(3);
                
                com.appsee.Appsee.setLocation(latitude, longitude, (float) horizontalAccuracy, (float) verticalAccuracy);
            }
            
            if (action.equals("setLocationDescription"))
            {
                String description = args.getString(0);
                com.appsee.Appsee.setLocationDescription(description);
            }
            
            if (action.equals("addEvent") && args.length() == 1)
            {
                String eventName = args.getString(0);
                com.appsee.Appsee.addEvent(eventName);
            }
            
            if (action.equals("addEventWithProperties") && args.length() > 1)
            {
                String eventName = args.getString(0);
                JSONObject json = args.getJSONObject(1);
                HashMap<String, Object> props = new HashMap<String, Object>();
                
                Iterator<String> iter = json.keys();
                while (iter.hasNext())
                {
                    String key = iter.next();
                    props.put(key, json.get(key));
                }
                
                com.appsee.Appsee.addEvent(eventName, props);
            }

            if (action.equals("startScreen"))
            {
                String screenName = args.getString(0);
                com.appsee.Appsee.startScreen(screenName);
            }

            if (action.equals("generate3rdPartyID"))
            {
                String systemName = args.getString(0);
                Boolean isPersistent = args.getBoolean(1);
                result = com.appsee.Appsee.generate3rdPartyId(systemName, isPersistent);
            }

            if (action.equals("set3rdPartyID"))
            {
                String externalID = args.getString(0);
                String systemName = args.getString(1);
                Boolean isPersistent = args.getBoolean(2);
                com.appsee.Appsee.set3rdPartyId(externalID, systemName, isPersistent);
            }
            
            
            callbackContext.success(result);
            return true;
        }
        catch (Exception ex)
        {
            Log.e("Appsee", "Error in Appsee for PhoneGap: " + ex);
            callbackContext.error("Error in Appsee for PhoneGap. Exception:" + ex);
            return false;
        }
    }
    
}