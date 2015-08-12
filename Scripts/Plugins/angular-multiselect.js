
angular.module('ui.multiselect', []).directive('multiselectDropdown', [function () {
	return function(scope, element, attributes) {
        
		// Get the element as a jQuery element
		element = $(element[0]); 
        
		element.multiselect({
			buttonClass : 'btn btn-small',
			buttonWidth : '200px',
			buttonContainer : '<div class="btn-group" />',
			maxHeight : 200,
			enableFiltering : false,
			buttonText : function(options) {
				if (options.length == 0) {
				    return '<span class="selectedoptions">' + element.data()['placeholder'] + '</span><div class="arrow"><b class="caret"></b></div>';
				} else if (options.length > 1) {
				    return '<span class="selectedoptions">' + _.first(options).text + ' + ' + (options.length - 1) + ' más seleccionados</span><div class="arrow"><b class="caret"></b></div>';
				} else {
				    return '<span class="selectedoptions">'+ _.first(options).text + '</span><div class="arrow"><b class="caret"></b></div>';
				}
			},
			// Replicate the native functionality on the elements so
			// that angular can handle the changes for us.
			onChange: function (optionElement, checked) {
				optionElement.removeAttr('selected');
				if (checked) {
					optionElement.attr('selected', 'selected');
				}
				element.change();
			}
            
		});
		// Watch for any changes to the length of our select element
		scope.$watch(function () {
			return element[0].length;
		}, function () {
			element.multiselect('rebuild');
		});
        
		// Watch for any changes from outside the directive and refresh
		scope.$watch(attributes.ngModel, function () {
			element.multiselect('refresh');
		});
	}
}]);
