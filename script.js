var app = angular.module('app', ['ngRoute']);
const {remote} = require('electron');

app.service('image', function(){
    var imagePath = "";
    var dimensions = [];
    var win;

    this.setImagePath = function(path){
        imagePath = path;
    };
    this.getImagePath = function(){
        return imagePath;
    };

    this.setImagedimensions = function(imgDimensions){
        dimensions = imgDimensions;
    };
    this.getImagedimensions = function(){
        return dimensions;
    };

    this.setWindow = function(window){
        win = window;
    };
    this.getWindow = function(window){
        return win;
    };
});

app.config(function($routeProvider){
    $routeProvider.when('/', {
        templateUrl: `${__dirname}/components/home/home.html`,
        controller: 'homeCtrl'
    }).when('/edit', {
        templateUrl: `${__dirname}/components/editImage/editImage.html`,
        controller: 'editCtrl'
    }).otherwise({
        template: '404 bro'
    });
});

app.controller('headCtrl', function($scope, image){
    var win = remote.getCurrentWindow()
    $scope.close = function(){
        var tempWin = image.getWindow();
        if(!!tempWin){
            tempWin.close();
        }
        win.close();
    };
    $scope.maximize = function(){
        win.isMaximized()? win.unmaximize() : win.maximize()
    };
    $scope.minimize = function(){
        win.minimize();
    };
});
app.controller('homeCtrl', function($scope, $location, image){
    $scope.pickFile = function()
    {
        var {dialog} = remote;
        dialog.showOpenDialog(
            {
            properties: ['openFile'],
            filters: [{
                name: 'Images',
                extensions: ['jpg','jpeg', 'png', 'JPG','JPEG', 'PNG']
            }]
            }, function(file)
            {
                console.log(file);
                if(!!file){
                    var path = file[0];

                    var sizeof = require('image-size');
                    var dimensions = sizeof(path);
                    image.setImagedimensions(dimensions);

                    image.setImagePath(path);
                    $location.path('/edit');
                    $scope.$apply();
                }
            }
        );
    };
});

app.controller('editCtrl', function($scope, image, $location){
    $scope.imagePathFile = image.getImagePath();
    $scope.controlsActive = false;
    
    var generatedStyles = "";
    var imageReferance = document.getElementById('mainImage');
    
    $scope.effects = {
        'Brightness' : {val:100  , min: 0, max: 200  , delim: '%'    },
        'Contrast'  : {val:100  , min: 0, max: 200  , delim: '%'    },
        'Invert'    : {val:0    , min: 0, max: 100  , delim: '%'    },
        'Hue-Rotate': {val:0    , min: 0, max: 360  , delim: 'deg'  },
        'Sepia'     : {val:0    , min: 0, max: 100  , delim: '%'    },
        'Grayscale' : {val:0    , min: 0, max: 100  , delim: '%'    },
        'Saturate'  : {val:100  , min: 0, max: 200  , delim: '%'    },
        'Blur'      : {val:0    , min: 0, max: 5    , delim: 'px'   },
    }

    $scope.imageEffect = function(effectName){
        console.log(effectName);
        $scope.controlsActive = true;
        $scope.activeEffect = effectName;
    };

    $scope.setEffect = function(){
        generatedStyles = "";
        for(let i in $scope.effects){ // i = brightness and $scope.effects[i].val
            // "brightness(10%) Contrast(0%) ..."
            generatedStyles += `${i}(${$scope.effects[i].val+$scope.effects[i].delim}) `;
        }
        //console.log(generatedStyles);
        imageReferance.style.filter = generatedStyles;
    };

    $scope.hideThis = function(){
        $scope.controlsActive = false;
    };

    $scope.change = function(){
        $location.path('/');
    };
    $scope.save = function(){
        const {BrowserWindow} = remote;
        var dimensions = image.getImagedimensions();
        var src = image.getImagePath();
        let styles = imageReferance.style.filter;
        var win = image.getWindow();
        if(!!win){
            win.close();
        }
        win = new BrowserWindow({
            frame: false,
            show: false,
            width: dimensions.width,
            height: dimensions.height,
            webPreferences: {
                webSecurity: false
            }
        });
        image.setWindow(win);
        win.loadURL(
            `data:text/html,
                <style>
                *{
                    margin:0;
                    padding:0;
                }
                </style>
                <img src="${src}" style="filter:${styles};">
                <script> 
                    var screenshot = require('electron-screenshot');
                    screenshot({
                        filename: 'userFile.png', 
                        delay: 500
                    });

                </script>
            `);
    };
});