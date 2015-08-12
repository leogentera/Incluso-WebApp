(function () {

    namespace('models');

    // --------------- Collection Model  ---------------

    models.Courses = Backbone.Collection.extend({

        model: models.Course,

        storage: null,

        url: API_RESOURCE.format("course"),

        initialize: function () {
            this.storage = new Offline.Storage('courses', this);
        }
    });



}).call(this);