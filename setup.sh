# Installing Node Js
echo "
##############################################
###         Installing Node JS 6.x         ###
##############################################
"
echo
sudo apt-get update
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installing NGINX
echo "
##############################################
###            Installing NGINX            ###
##############################################
"
sudo apt-get update
sudo apt-get install nginx

# Installing yo, bower
echo "
##############################################
###          Installing bower, yo          ###
##############################################
"
sudo npm install -g yo
sudo npm install -g bower

# Setting up the project
echo "
##############################################
###         Setting up the project         ###
##############################################
"
npm install
bower install

# Setting up the nginx proxy
echo "
##############################################
###      Setting up the nginx proxy        ###
##############################################
"
sudo cp ./deploy/nginx/nginx.conf /etc/nginx/

# Setting up the upstart job
echo "
##############################################
###      Setting up the upstart job        ###
##############################################
"
sudo cp ./deploy/upstart/yeoman-ui.conf /etc/init/

echo "
##############################################
###  Yeoman UI was installed successfully  ###
###  And all the yeoman generators which   ###
###  are installed in the host environment ###
###  will be available via the UI          ###
###  http://localhost:80                   ###
###                                        ###
###     sudo service yeoman-ui start       ###
###     sudo service yeoman-ui stop        ###
##############################################
"
