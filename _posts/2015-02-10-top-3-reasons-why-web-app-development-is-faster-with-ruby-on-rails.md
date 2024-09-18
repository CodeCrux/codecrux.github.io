---
title: 2024-08-10 How to configure godaddy domain on heroku
description: "The first step is adding the GoDaddy domain to the Heroku app. "
image: /img/blogs/how-to-configure-godaddy-domain-on-heroku.webp
layout: "post "
permalink: /blog/:title
author: Shyam Mohan
category: Godaddy
date: 2024-08-10T05:34:00.000Z
---
**Setting Up Heroku and Godaddy**

The first step is adding the GoDaddy domain to the Heroku app. Navigate to the project folder from the terminal then type "heroku domains:add www.yourdomain.com". The domain name is the one purchased from GoDaddy.  

  

Next, log into your GoDaddy account and find the domains area in the upper left navigation tab. The domains tab will allow you to choose a domain then launch. Doing this redirects to the domain details page. The domains details page will show the DNS files related to the domain name. Click on the "DNS Zone File" tab and remove all records leaving only the NameServers.  

  

The next step is adding “www” CNAME record that will point to the Heroku app domain. Change 'Host' to www and “Point to” the Heroku app domain. The Heroku app domain is something like 'myapp.herokuapp.com'. The DNS will then take some time to propagate. DNS propagation time varies and may take less than ten minutes or even a day. Once the DNS propagation is complete, the Heroku app will be accessible under the GoDaddy domain.  

  

**Configuring Naked Domain** 

This section explains how to configure the domain name to work without www in front of the domain name. When a person accesses the domain by typing 'yourdmain.com' instead of "www.yourdmain.com" they should be redirected to the same domain with www. The naked domain 'yourdmain.com' is forwarded to "www.yourdomain.com".  

Assuming you are on the domains page, locate the "Settings" tab and click on it.Four section will appear.  

\> Click "Manage" right under "Domain" in the "Forwarding" section to open a window to add forwarding details.  

\> Click "Add Forwarding" to add the forward details. Set "Forward to" to your domain name, which in this example is “www.yourdmain.com”. Set "Redirect type" to "301 (Permanent)"" and "Forward settings" to "Forward only".  

\> To update your domain's IP Address for forwarding for domains registered at another company  

\> From the top menu, click the DNS tab, and select Manage Zones.  

\> Enter the domain name you want to use and click Search.  

\> At the bottom of the Records section, click Add and select A from the drop-down list.  

  

**Complete the other fields:** 

\> Host Name - Enter the host name the A record links to. Type @ to point the record directly to your domain name, including the www.  

\> Points to IP Address - Enter 50.63.202.1.  

\> TTL - Select how long the server should cache the information.  

\> Click Save.  

Refrence : \[https://in.godaddy.com/help/update-my-domains-ip-address-for-forwarding-5289](https://in.godaddy.com/help/update-my-domains-ip-address-for-forwarding-5289)
