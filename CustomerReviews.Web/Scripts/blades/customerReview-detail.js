angular.module('CustomerReviews.Web')
    .controller('CustomerReviews.Web.customerReviewDetailController', ['$scope', 'platformWebApp.bladeNavigationService', 'CustomerReviews.WebApi',
        function ($scope, bladeNavigationService, reviewsApi) {
            var blade = $scope.blade;
            blade.updatePermission = 'customerReview:update';
            blade.refresh = function (parentRefresh) {
                
                reviewsApi.get({ id: blade.currentEntityId }, function (data) {
                    
                    initializeBlade(data);

                    if (blade.childrenBlades) {
                        _.each(blade.childrenBlades, function (x) {
                            if (x.refresh) {
                                x.refresh(blade.currentEntity);
                            }
                        });
                    }

                    if (parentRefresh) {
                        blade.parentBlade.refresh();
                    }
                },
                    function (error) { bladeNavigationService.setError('Error ' + error.status, blade); });
            }

            function initializeBlade(data) {

                blade.currentEntity = angular.copy(data);
                blade.origEntity = data;
                blade.isLoading = false;
                //blade.securityScopes = data.securityScopes;
            };

            function isDirty() {
                return !angular.equals(blade.currentEntity, blade.origEntity) && blade.hasUpdatePermission();
            }

            function canSave() {
                return isDirty() && formScope && formScope.$valid;
            }
            blade.selectProduct = function (data) {
                console.log(data);
                newBlade = {
                    id: data,
                    itemId: data,
                    //productType: listItem.productType,
                    //title: listItem.name,
                    //catalog: blade.catalog,
                    controller: 'virtoCommerce.catalogModule.catalogsListController',
                    template: 'Modules/$(VirtoCommerce.Catalog)/Scripts/blades/catalogs-list.tpl.html'
                };
                bladeNavigationService.showBlade(newBlade, blade);
            }
            $scope.saveChanges = function () {
                blade.isLoading = true;
                console.log('saveChanges');
                if (blade.isNew) {
                    reviewsApi.save({}, blade.currentEntity, function (data) {
                        blade.isNew = undefined;
                        blade.currentEntityId = data.id;
                        initializeBlade(data);
                        initializeToolbar();
                        $scope.gridsterOpts.maxRows = 3; // force re-initializing the widgets
                        blade.refresh(true);
                    }, function (error) {
                        bladeNavigationService.setError('Error ' + error.status, blade);
                    });
                }
                else {
                    console.log('update1');
                    reviewsApi.update({}, blade.currentEntity, function () {
                        console.log('update2');
                        blade.refresh(true);
                    }, function (error) {
                        bladeNavigationService.setError('Error ' + error.status, blade);
                    });
                }
            };

            var formScope;
            $scope.setForm = function (form) { formScope = form; }

            function initializeToolbar() {
                if (!blade.isNew) {
                    blade.toolbarCommands = [
                        {
                            name: "platform.commands.save", icon: 'fa fa-save',
                            executeMethod: function () {
                                $scope.saveChanges();
                            },
                            canExecuteMethod: canSave,
                            permission: blade.updatePermission
                        },
                        {
                            name: "platform.commands.reset", icon: 'fa fa-undo',
                            executeMethod: function () {
                                angular.copy(blade.origEntity, blade.currentEntity);
                            },
                            canExecuteMethod: isDirty,
                            permission: blade.updatePermission
                        }
                    ];
                }
            }

            initializeToolbar();
            blade.refresh(false);
        }]);