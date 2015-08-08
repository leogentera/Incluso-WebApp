(function () {

    namespace('models');

    // --------------- Model  ---------------

    models.Dashboard = Backbone.Model.extend({

        //urlRoot: API_RESOURCE.format('Referral/single'),

        fetch: function (options) {
            var model = this;
            model.set(
                {
                    id: 1,
                    firstName: "Fernando",
                    lastName: "Gutierrez",
                    username: "fernando.gutierrez",
                    Age: "40"
                }
            );
            model.trigger('sync', model, null, options);
        }
    });

}).call(this);

