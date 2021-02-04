$(document).ready(function() {
	$('body')
	.on({
	        click: function(event) {
				if ( $(this).data('toggle') != undefined ) {
					$('.overlay_close').trigger('click');
				}
	        }
	    },
	    '.xssm #top_menu a'
	);

	$('#top_menu ul').each(function() {
        if ($(this).parent().prop('tagName').toLowerCase() == 'li') {
            $(this).parent().addClass('dropdown');
        }
    });

	$('body')
	.on({
	        click: function(event) {
	            var listItem = $(this).parent();

		        if ( $('> ul', listItem).length ) {
		            event.preventDefault();

		            listItem.toggleClass('active');
		            $('> ul', listItem).slideToggle(300);
		        }
	        }
	    },
	    '.xssm #top_menu a'
	)
	.on({
	        mouseenter: function() {
	            if ( $('> ul', this).length ) {
		            $(this).addClass('active');
		            $('> ul', this).fadeIn(300);
		        }
	        },
	        mouseleave: function() {
	            $(this).removeClass('active');
        		$('> ul', this).finish().fadeOut(300);
	        }
	    },
	    '.mdlg #top_menu li'
	);
});