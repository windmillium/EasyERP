define([
    'text!templates/ownCompanies/list/ListHeader.html',
    'views/ownCompanies/CreateView',
    'views/ownCompanies/list/ListItemView',
    'dataService'
],

    function (ListTemplate, CreateView, ListItemView, dataService) {
        var ownCompaniesListView = Backbone.View.extend({
            el: '#content-holder',
            defaultItemsNumber : 50,

            initialize: function (options) {
				this.startTime = options.startTime;
                this.collection = options.collection;
                this.collection.bind('reset', _.bind(this.render, this));
                if (this.collection.namberToShow)
                    this.defaultItemsNumber = this.collection.namberToShow;
                this.render();
            },

            events: {
                "click .itemsNumber": "switchPageCounter",
                "click .showPage": "showPage",
                "change #currentShowPage": "showPage",
                "click #previousPage": "previousPage",
                "click #nextPage": "nextPage",
                "click .checkbox": "checked",
                "click  .list td:not(.notForm)": "gotoForm",
				"click #itemsButton": "itemsNumber",
				"click .currentPageList": "itemsNumber",
				"click":"hideItemsNumber"

            },
 			hideItemsNumber:function(e){
				$(".allNumberPerPage").hide();
			},
			itemsNumber:function(e){
				$(e.target).closest("button").next("ul").toggle();
				return false;
			},
            render: function () {
                var self = this;
                $('.ui-dialog ').remove();
                this.$el.html(_.template(ListTemplate));
                var itemView = new ListItemView({ collection: this.collection });
                itemView.bind('incomingStages', itemView.pushStages, itemView);
                this.$el.append(itemView.render());
                $('#check_all').click(function () {
                    $(':checkbox').prop('checked', this.checked);
                    if ($("input.checkbox:checked").length > 0)
                        $("#top-bar-deleteBtn").show();
                    else
                        $("#top-bar-deleteBtn").hide();
                });
                dataService.getData('/ownCompaniesListLength', { mid: 39 }, function (response) {
                    self.listLength = response.listLength;
                    var itemsNumber = self.defaultItemsNumber;
                    $("#itemsNumber").text(itemsNumber);
                    if ((self.listLength == 0) || self.listLength == undefined) {
                        $("#grid-start").text(0);
                        $("#grid-end").text(0);
                        $("#grid-count").text(0);
                        $("#previousPage").prop("disabled",true);
                        $("#nextPage").prop("disabled",true);
                        $("#pageList").empty();
                        $("#currentShowPage").val(0);
                        $("#lastPage").text(0);
                    } else {
                        $("#grid-start").text(1);
                        if (self.listLength <= itemsNumber) {
                            $("#grid-end").text(self.listLength);
                        } else {
                            $("#grid-end").text(itemsNumber);
                        }
                        $("#grid-count").text(self.listLength);
                        $("#pageList").empty();
                        var pageNumber = Math.ceil(self.listLength/itemsNumber);
                        for (var i=1;i<=pageNumber;i++) {
                            $("#pageList").append('<li class="showPage">'+ i +'</li>')
                        }
                        $("#lastPage").text(pageNumber);
                        $("#currentShowPage").val(1);
                        $("#previousPage").prop("disabled",true);
                        if (pageNumber <= 1) {
                            $("#nextPage").prop("disabled",true);
                        } else {
                            $("#nextPage").prop("disabled",false);
                        }
                    }
                });
				$(document).on("click",function(){
					self.hideItemsNumber();
				});
				this.$el.append("<div id='timeRecivingDataFromServer'>Created in "+(new Date()-this.startTime)+" ms</div>");
            },

            previousPage: function (event) {
                event.preventDefault();
                var itemsNumber = $("#itemsNumber").text();
                var page = parseInt($("#currentShowPage").val()) - 1;
                $("#currentShowPage").val(page);

                if (this.collection.listLength == 0) {
                    $("#grid-start").text((page - 1)*itemsNumber);
                } else {
                    $("#grid-start").text((page - 1)*itemsNumber+1);
                }

                if (this.collection.listLength <= page*itemsNumber ) {
                    $("#grid-end").text(this.collection.listLength);
                } else {
                    $("#grid-end").text(page*itemsNumber);
                }
                $("#grid-count").text(this.collection.listLength);

                _.bind(this.collection.showMore, this.collection);
                this.collection.showMore({count: itemsNumber, page: page});
                $("#nextPage").prop("disabled",false);
            },

            nextPage: function (event) {
                event.preventDefault();
                var itemsNumber = $("#itemsNumber").text();
                var page =  parseInt($("#currentShowPage").val()) + 1;
                $("#currentShowPage").val(page);

                if (this.collection.listLength == 0) {
                    $("#grid-start").text((page - 1)*itemsNumber);
                } else {
                    $("#grid-start").text((page - 1)*itemsNumber+1);
                }

                if (this.collection.listLength <= page*itemsNumber ) {
                    $("#grid-end").text(this.collection.listLength);
                } else {
                    $("#grid-end").text(page*itemsNumber);
                }
                $("#grid-count").text(this.collection.listLength);

                _.bind(this.collection.showMore, this.collection);
                this.collection.showMore({count: itemsNumber, page: page});
                $("#previousPage").prop("disabled",false);
            },

            switchPageCounter: function (event) {
                event.preventDefault();
                $("#previousPage").prop("disabled",true);
                var itemsNumber = event.target.textContent;
                $("#itemsNumber").text(itemsNumber);
                $("#currentShowPage").val(1);

                if ((this.collection.listLength == 0) || this.collection.listLength == undefined) {
                    $("#grid-start").text(0);
                    $("#nextPage").prop("disabled",true);
                } else {
                    $("#grid-start").text(1);
                }

                if (this.collection.listLength) {
                    if (this.collection.listLength <= itemsNumber) {
                        $("#grid-end").text(this.collection.listLength);
                        $("#nextPage").prop("disabled",true);
                    } else {
                        $("#grid-end").text(itemsNumber);
                        $("#nextPage").prop("disabled",false);
                    }
                } else {
                    $("#grid-end").text(0);
                    $("#nextPage").prop("disabled",true);
                }

                $("#grid-count").text(this.collection.listLength);

                _.bind(this.collection.showMore, this.collection);
                this.collection.showMore({count: itemsNumber, page: 1});
            },

            showPage: function (event) {
                event.preventDefault();
                var itemsNumber = $("#itemsNumber").text();
                var page = event.target.textContent;
                if (!page) {
                    page = $(event.target).val();
                }
                var adr = /^\d+$/;
                var lastPage = $('#lastPage').text();

                if (!adr.test(page) || (parseInt(page) <= 0) || (parseInt(page) > parseInt(lastPage))) {
                    page = 1;
                }

                $("#itemsNumber").text(itemsNumber);
                $("#currentShowPage").val(page);

                if (this.collection.listLength == 0) {
                    $("#grid-start").text((page - 1)*itemsNumber);

                } else {
                    $("#grid-start").text((page - 1)*itemsNumber+1);
                }

                if (this.collection.listLength <= page*itemsNumber ) {
                    $("#grid-end").text(this.collection.listLength);
                } else {
                    $("#grid-end").text(page*itemsNumber);
                }

                $("#grid-count").text(this.collection.listLength);

                _.bind(this.collection.showMore, this.collection);
                this.collection.showMore({count: itemsNumber, page: page});
            },

            showMoreContent: function (newModels) {
                $("#listTable").empty();
                new ListItemView({ collection: newModels }).render();
                $("#pageList").empty();
                var itemsNumber = $("#itemsNumber").text();
                var pageNumber;

                if (this.collection.listLength) {
                    pageNumber = Math.ceil(this.collection.listLength/itemsNumber);
                } else {
                    pageNumber = 0;
                }

                var currentPage = $("#currentShowPage").val();
                for (var i=currentPage;i<=pageNumber;i++) {
                    $("#pageList").append('<li class="showPage">'+ i +'</li>')
                }
                $("#lastPage").text(pageNumber);

                if (currentPage <= 1) {
                    $("#previousPage").prop("disabled",true);
                } else {
                    $("#previousPage").prop("disabled",false);
                }

                if ((currentPage == pageNumber) || (pageNumber <= 1)) {
                    $("#nextPage").prop("disabled",true);
                } else {
                    $("#nextPage").prop("disabled",false);
                }
            },
            gotoForm: function (e) {
                App.ownContentType = true;
                var id = $(e.target).closest("tr").data("id");
                window.location.hash = "#easyErp/ownCompanies/form/" + id;
            },

            createItem: function () {
                //create editView in dialog here
                new CreateView();
            },

            checked: function () {
                if (this.collection.length > 0) {
                    if ($("input.checkbox:checked").length > 0)
                        $("#top-bar-deleteBtn").show();
                    else
                    {
                        $("#top-bar-deleteBtn").hide();
                        $('#check_all').prop('checked', false);
                    }
                }
            },

            deleteItems: function () {
                var that = this,
                    mid = 39,
                    model;
                var localCounter = 0;
                $.each($("tbody input:checked"), function (index, checkbox) {
                    model = that.collection.get(checkbox.value);
                    model.destroy({
                        headers: {
                            mid: mid
                        }
                    });
                    that.collection.listLength--;
                    localCounter++
                });
                $("#grid-count").text(this.collection.listLength);
                this.defaultItemsNumber = $("#itemsNumber").text();
                this.deleteCounter = localCounter;
                this.collection.trigger('reset');
            }

        });

        return ownCompaniesListView;
    });
