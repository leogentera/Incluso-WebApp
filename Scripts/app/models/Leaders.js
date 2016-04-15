(function () {

    namespace('models');

    // --------------- Collection Model  ---------------

    models.Leaders = Backbone.Collection.extend({

        model: Profile,

        fetch: function () {
            var items = this;
            items.add(
                [
                  { name: "Tim", age: 5 },
                  { name: "Ida", age: 26 },
                  { name: "Rob", age: 55 }
                ]
            );
            model.trigger('sync', model, null, options);
        }
    });



}).call(this);