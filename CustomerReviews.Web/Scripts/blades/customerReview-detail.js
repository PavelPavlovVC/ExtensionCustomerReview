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
            blade.selectProduct = function (parentElement) {
                console.log('Select product');
                if (parentElement.productId) {
                    console.log('Product');
                    console.log(parentElement.productId);
                    let itemDetailBlade = {
                        id: "listItemDetail",
                        itemId: parentElement.productId,
                        title: parentElement.productName,
                        controller: 'virtoCommerce.catalogModule.itemDetailController',
                        template: 'Modules/$(VirtoCommerce.Catalog)/Scripts/blades/item-detail.tpl.html'
                    };
                    bladeNavigationService.showBlade(itemDetailBlade, $scope.blade);
                    return;
                }
                var selectedListEntries = [];
                console.log('execute select product');
                var newBlade = {
                    id: "CatalogEntrySelect",
                    title: "marketing.blades.catalog-items-select.title-product",
                    controller: 'virtoCommerce.catalogModule.catalogItemSelectController',
                    template: 'Modules/$(VirtoCommerce.Catalog)/Scripts/blades/common/catalog-items-select.tpl.html',
                    breadcrumbs: [],
                    toolbarCommands: [
                        {
                            name: "platform.commands.pick-selected", icon: 'fa fa-plus',
                            executeMethod: function (blade) {
                                //parentElement.selectedListEntry = selectedListEntries[0];
                                parentElement.productId = selectedListEntries[0].id;
                                parentElement.productName = selectedListEntries[0].name;
                                parentElement.productCode = selectedListEntries[0].code;
                                //console.log(selectedListEntries[0].id);
                                //console.log(selectedListEntries[0].name);
                                bladeNavigationService.closeBlade(blade);
                                console.log(selectedListEntries[0].name);
                                $scope.blade.currentEntity.productTitle = selectedListEntries[0].name;
                                $scope.blade.currentEntity.productId = selectedListEntries[0].id;;
                                //$scope.productId = selectedListEntries[0].name;
                                //$scope.productTitle=
                            },
                            canExecuteMethod: function () {
                                return selectedListEntries.length == 1;
                            }
                        }]
                };

                newBlade.options = {
                    showCheckingMultiple: false,
                    checkItemFn: function (listItem, isSelected) {
                        if (listItem.type == 'category') {
                            newBlade.error = 'Must select Product';
                            listItem.selected = undefined;
                        } else {
                            if (isSelected) {
                                if (_.all(selectedListEntries, function (x) { return x.id != listItem.id; })) {
                                    selectedListEntries.push(listItem);
                                }
                            }
                            else {
                                selectedListEntries = _.reject(selectedListEntries, function (x) { return x.id == listItem.id; });
                            }
                            newBlade.error = undefined;
                        }
                    }
                };
                /*
                newBlade = {
                    id: data,
                    itemId: data,
                    //productType: listItem.productType,
                    //title: listItem.name,
                    //catalog: blade.catalog,
                    controller: 'virtoCommerce.catalogModule.catalogsListController',
                    template: 'Modules/$(VirtoCommerce.Catalog)/Scripts/blades/catalogs-list.tpl.html'
                };
                */
                bladeNavigationService.showBlade(newBlade, $scope.blade);
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
                    
                    reviewsApi.update({}, blade.currentEntity, function () {
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