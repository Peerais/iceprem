// JavaScript Document
var gridType, wh, whtml, wraph, hdiff;

var mesajListe = {
    bilinmeyenHata : "Bilinmeyen bir hata oluştu !"
};

function is_email( str ) {
	var nstr;
	nstr = str;
	nstr = nstr.replace(" ","");
	if (nstr.indexOf("@") < 1) return false;
	if (nstr.lastIndexOf(".") < nstr.indexOf("@")) return false;
	if (nstr.lastIndexOf(".") == (nstr.length-1)) return false;
	return true;
}

function declareFormVariables( activeButton ) {
	var formBox = activeButton.closest('.form_box');
	var warning = $('.notification .alert-danger', formBox);

	var variables = {
		'formBox' : formBox,
		'warning'  : $('.notification .alert-danger', formBox),
	    'success'  : $('.notification .alert-success', formBox),
	    'loading'  : $('.notification .alert-loading', formBox),
	    'activeButton' : activeButton,
	    'loadingText'  : activeButton.data('loading-text'),
	    'formPosition' : warning.length ? formBox.offset().top - 10 : -1
	}

	$('.notification .alert', formBox).hide();

	return variables;
}

function checkFormValidate( formVariables ) {
	var formBox = formVariables.formBox;
	var inputType, inputName, errorState = false;

    $('.failed', formBox).removeClass('failed');
    
    $('.required:visible', formBox).each(function () {
    	inputType = $(this).prop('type');
    	inputName = $(this).prop('name');

    	if ( inputType == 'radio' || inputType == 'checkbox' ) {
			if ( !$('[name='+ inputName +']', formBox).is(':checked') ) {
				$(this).closest('div').addClass('failed');
				errorState = true;
			}
    	} else {
	        if ($(this).val() == '') {
	            $(this).addClass('failed');
	            errorState = true;
	        }
    	}
    });

    if (errorState) {
    	return showFormWarning(formVariables,'Lütfen işaretli alanları kontrol ediniz.');
    }

    return true;
}

function clearFormItems( formVariables ) {
    var formBox = formVariables.formBox;

    formBox.find('input, select, textarea')
    	.not(':submit, :reset, :button, :hidden')
        .val('')
        .prop('checked', false)
        .prop('selected', false);
}

function showFormWarning( formVariables, warningMessage ) {
	var warning 	 = formVariables.warning;
	var formPosition = formVariables.formPosition;

	if ( warning.length ) {
		warning.html(warningMessage).show().delay(3000).slideUp();
		changePageScroll(formPosition);
	}

	toggleFormLoading(formVariables, 'hide');

	return false;
}

function showFormSuccess( formVariables, successMessage ) {
	var success 	 = formVariables.success;
	var formPosition = formVariables.formPosition;

	if ( success.length ) {
		success.html(successMessage).show().delay(3000).slideUp();
		changePageScroll(formPosition);
	}
}

function toggleFormLoading( formVariables, state ) {
	var loading 	 = formVariables.loading;
	var activeButton = formVariables.activeButton;
	var loadingText  = formVariables.loadingText;
	var formPosition = formVariables.formPosition;

	if ( state == 'show') {
		if ( loadingText != undefined ) {
			activeButton.button('loading');
		} else {
			if ( loading.length ) {
				loading.show(); changePageScroll(formPosition);
			}
		}
	} 
	else {
		activeButton.button('reset'); loading.hide();
	}
}

function changePageScroll( position ) {
	if ( position > -1 ) $("html,body").animate({ scrollTop: position }, 500);
}

function bizeUlasin( activeForm ) {
	var activeButton  = $(activeForm).find('.btn');
	var formVariables = declareFormVariables( activeButton );
	var formBox = formVariables.formBox;

	if (!checkFormValidate(formVariables)) { return false }
	
	if ($('.verifyCaptcha', formBox).val() != 'true') { return false }

    toggleFormLoading(formVariables, 'show');

    $.ajax({
        type: 'POST',
        url : $('form', formBox).attr('action'),
        data: $('form', formBox).serialize(),
        success: function (ajaxCevap) {
        	toggleFormLoading(formVariables, 'hide');

            if (ajaxCevap == 'OK') {
            	showFormSuccess(formVariables, 'Mesajınız gönderildi.');
            	clearFormItems(formVariables);
				modalTimer = setTimeout(function() {
		            clearTimeout(modalTimer);
		        	$('#bize_ulasin').modal('hide');                	
			    }, 3000);
            } else {
            	showFormWarning(formVariables, mesajListe.bilinmeyenHata);
            }
        }
    });

    return false;
}

function degisimTalep( activeForm ) {
	var activeButton  = $(activeForm).find('.btn');
	var formVariables = declareFormVariables( activeButton );
	var formBox = formVariables.formBox;

	if (!checkFormValidate(formVariables)) { return false }

    toggleFormLoading(formVariables, 'show');

    $.ajax({
        type: 'POST',
        url : $('form', formBox).attr('action'),
        data: $('form', formBox).serialize(),
        success: function (ajaxCevap) {
        	toggleFormLoading(formVariables, 'hide');

            if (ajaxCevap == 'NEW') {
            	showFormSuccess(formVariables, 'Siparişinize yeni hesap ataması yapıldı.');
				clearFormItems(formVariables);
            	modalTimer = setTimeout(function() {
		            clearTimeout(modalTimer);
		        	window.location.href = window.location.href;            	
			    }, 3000);
            } else if (ajaxCevap == 'OK') {
            	showFormSuccess(formVariables, 'Talebiniz gönderildi.');
				clearFormItems(formVariables);
            	modalTimer = setTimeout(function() {
		            clearTimeout(modalTimer);
		        	$('#degisim_talep').modal('hide');                	
			    }, 3000);
            } else {
            	showFormWarning(formVariables, mesajListe.bilinmeyenHata);
            }
        }
    });

    return false;
}

function showSatinAlForm(urunId) {
	var activeModal = $('#satin_al');
	var activeForm  = $('form[name=satin_al_formu]');
	
	$.ajax({					
		type : 'POST',
		url : '/inc/islem_urunbilgileri.asp',
		data : 'UrunId=' + urunId,
		dataType : 'json',
		success : function(jsonData) {
			returnMessage = jsonData.returnMessage;

			if (returnMessage == 'OK') {
				$('[name=OdemeTipi] option[value=3]', activeForm).remove();
				$('#txtUrunAdi').text(jsonData.urunAdi);
				$('[name=UrunId]', activeForm).val(jsonData.urunId);
				$('[name=UrunAdi]', activeForm).val(jsonData.urunAdi);

				activeModal.modal('show');
			} else {
				window.location.href = window.location.href;
			}
		}
	});	
}

function siparisiTamamla(activeForm) {
	var activeButton  = $(activeForm).find('.btn');
	var formVariables = declareFormVariables(activeButton);
	var formBox 	  = formVariables.formBox;
	var activeModal   = $('#satin_al');
	var errorMessage, errorState = false;

	if (!checkFormValidate(formVariables)) { return false }

	var eposta = $('input[name="MusteriEPosta"]', formBox).val();

    if ( !is_email(eposta) ) {
    	return showFormWarning(formVariables, 'E-Posta adresinizi kontrol ediniz.');
    }

    if(!$('input[name="KosullarOnay"]', formBox).is(':checked')) {
		return showFormWarning(formVariables, 'Kullanım şartlarını okuyup, onaylayınız.');
	}

 	$('button.close', activeModal).css('visibility','hidden'); 	
 	activeModal.data('bs.modal').options.backdrop = 'static';

    toggleFormLoading(formVariables, 'show');

    $.ajax({
        type: 'POST',
        url : '/inc/islem_siparisitamamla.asp',
        data: $('form', formBox).serialize(),
        dataType : 'json',
        async : false,
		success : function(jsonData) {
			returnState   = jsonData.returnState;
			returnMessage = jsonData.returnMessage;			
			toBePayUrl 	  = jsonData.toBePayUrl;
			siparisId 	  = jsonData.siparisId;
			toplamTutar   = jsonData.toplamTutar;

			if (returnState == 'SendToPay') {
				$('[name=SiparisId]', activeForm).val(siparisId);
				$('[name=ToplamTutar]', activeForm).val(toplamTutar);

				$('form', formBox).attr('method', 'post');
				$('form', formBox).attr('action', toBePayUrl);
				$('form', formBox).attr('onsubmit', '');
				$('form', formBox).submit();			
			} else 
			if (returnState == 'Reset') {
				window.location.href = window.location.href;
			} else {
				errorState = true;

				if (returnState == 'Err') {				
			    	errorMessage = returnMessage;
				} else {
			    	errorMessage = 'Ödeme sırasında hata oluştu!';
				}
			}
		},
		error : function(jqXHR, textStatus, errorThrown) {
		    errorState = true;
		    errorMessage = mesajListe.bilinmeyenHata;
		    errorMessage = textStatus + ' : ' + errorThrown;
		}
    });

    if (errorState) {
		formVariables.warning.html(errorMessage).show();
		$('button.close', activeModal).css('visibility','visible');
		activeModal.data('bs.modal').options.backdrop = true;
		toggleFormLoading(formVariables, 'hide');
    }

    return false;
}

function promosyonKullan(activeForm) {
	var activeButton  = $(activeForm).find('.btn');
	var formVariables = declareFormVariables(activeButton);
	var formBox 	  = formVariables.formBox;
	var activeModal   = $('#promosyon');
	var errorMessage, errorState = false;

	if (!checkFormValidate(formVariables)) { return false }

	var eposta = $('input[name="MusteriEPosta"]', formBox).val();

    if ( !is_email(eposta) ) {
    	return showFormWarning(formVariables, 'E-Posta adresinizi kontrol ediniz.');
    }

    if(!$('input[name="KosullarOnay"]', formBox).is(':checked')) {
		return showFormWarning(formVariables, 'Kullanım şartlarını okuyup, onaylayınız.');
	}

 	$('button.close', activeModal).css('visibility','hidden'); 	
 	activeModal.data('bs.modal').options.backdrop = 'static';

    toggleFormLoading(formVariables, 'show');

    $.ajax({
        type: 'POST',
        url : '/inc/islem_promosyonkullan.asp',
        data: $('form', formBox).serialize(),
        dataType : 'json',
        async : false,
		success : function(jsonData) {
			returnState   = jsonData.returnState;
			returnMessage = jsonData.returnMessage;			
			toBeTokenUrl  = jsonData.toBeTokenUrl;

			if (returnState == 'Ok') {
				window.location.href = toBeTokenUrl;
			} else {
				errorState = true;

				if (returnState == 'Err') {				
			    	errorMessage = returnMessage;
				} else {
			    	errorMessage = 'Sipariş sırasında hata oluştu!';
				}
			}
		},
		error : function(jqXHR, textStatus, errorThrown) {
		    errorState = true;
		    errorMessage = mesajListe.bilinmeyenHata;
		    errorMessage = textStatus + ' : ' + errorThrown;
		}
    });

    if (errorState) {
		formVariables.warning.html(errorMessage).show();
		$('button.close', activeModal).css('visibility','visible');
		activeModal.data('bs.modal').options.backdrop = true;
		toggleFormLoading(formVariables, 'hide');
    }

    return false;
}

function bultenKayit( activeForm ) {
	var activeButton  = $(activeForm).find('.btn');
	var formVariables = declareFormVariables( activeButton );
	var formBox = formVariables.formBox;

	if (!checkFormValidate(formVariables)) { return false }

    toggleFormLoading(formVariables, 'show');

    $.ajax({
        type: 'POST',
        url : $('form', formBox).attr('action'),
        data: $('form', formBox).serialize(),
        success: function (ajaxCevap) {
        	toggleFormLoading(formVariables, 'hide');

            if (ajaxCevap == 'OK') {
            	showFormSuccess(formVariables, 'Kaydınız oluşturuldu.');
				clearFormItems(formVariables);
            	modalTimer = setTimeout(function() {
		            clearTimeout(modalTimer);
		        	$('#bulten_kayit').modal('hide');
			    }, 3000);
            } else {
            	showFormWarning(formVariables, mesajListe.bilinmeyenHata);
            }
        }
    });

    return false;
}

$(document).ready(function() {
	$('.button_submit').on('click', function(event) {
		event.preventDefault();
		var formVariables = declareFormVariables( $(this) );
		var formBox = formVariables.formBox;

		if (!checkFormValidate(formVariables)) { return false }

		$('form', formBox).submit();
	});

	$('.button_action').on('click', function(event) {
		event.preventDefault();
		var formVariables = declareFormVariables( $(this) );
		var formBox = formVariables.formBox;
		var action  = $(this).data('action');

		if ( action != undefined ) {
			$('form', formBox).attr('action', action);
		}

		$('form', formBox).submit();
	});
});

$(document).ready(function() {
	// Css Media Query Listener
	var cache = [];

	var breakpoints = {
	    xssm: '(max-width: 991px)',
	    mdlg: '(min-width: 992px)',
	    xs:   '(max-width: 767px)',
	    sm:   '(min-width: 768px) and (max-width: 991px)',
	    md:   '(min-width: 992px) and (max-width: 1199px)',
	    lg:   '(min-width: 1200px)'
	};

	for (var name in breakpoints) {
	    !function(breakName, query) {
	        function cb(data) {
	        	$('.wrapper').toggleClass(breakName, data.matches);
	        }

	        cb({
	            media: query,
	            matches: matchMedia(query).matches
	        });

	        var m = matchMedia(query);
	        m.addListener(cb);
	        cache.push(m);

	    }(name, breakpoints[name]);
	}
});

$(document).ready(function () {
	gridType  = $('.wrapper').attr('class');

	// Scroll Up
	$('.scroll_up').click(function() {
		$("html,body").animate({ scrollTop: 0 }, 800);
	});

	// Switch menu
	$('.switch_menu').on('click', function(event) {
		var target = $(this).data('target');

		if (target != '') {
			event.preventDefault();

			if ($(target).hasClass('active')) {
				$('.overlay', this).hide(); $(target).removeClass('active');
			} else {
				$('.overlay', this).show(); $(target).addClass('active');
			}
		}
	});

	// Overlay close
	$('.overlay_close').on('click', function(event) {
		var target = $(this).data('target');

		if (target != '') {
			event.preventDefault();
			$('.overlay').hide(); $(target).removeClass('active');
		}
	});

	jQuery('.maximage .slider').maximage({
        cycleOptions: {
            timeout: 8000,
            prev: '.maximage .arrow_left',
            next: '.maximage .arrow_right'
        }
    });

    if ( $('body').find('.maximage').length ) {
    	$('body').addClass('index');

		$('.satin_al_link').click(function(event) {
			event.preventDefault();
			if ( $('.header').hasClass('sticky') ) {
				$("html,body").animate({ scrollTop: $('#satin_al_area').offset().top - 70 }, 1250);
			} else {
				$("html,body").animate({ scrollTop: $('#satin_al_area').offset().top + 60 }, 1250);
			}
		});

		$('.neden_biz_link').click(function(event) {
			event.preventDefault();
			$("html,body").animate({ scrollTop: $('#neden_biz_area').offset().top - 60 }, 1250);
		});
    }

    // maskedInput
	$.mask.definitions['9'] = '';
    $.mask.definitions['d'] = '[0-9]';
    $.mask.definitions['x'] = '[a-zA-Z0-9]';
    $('.phone_mask').mask("+90 (ddd) ddd dddd");
    
	// inputMask
	$('.promotion_mask').inputmask("****-****-****");
});

$(window).on('load', function () {
	// Trigger windows resize
	$(window).trigger('resize');
	
	// Egualizer Attributes
    var equalizerArray = [];

    $("[data-equalizer]").each(function () {
        var arrayItem = $(this).data('equalizer');
        if (equalizerArray.indexOf(arrayItem) < 0) {
            equalizerArray.push(arrayItem);
        }
    });

    $.each(equalizerArray, function (key, value) {
        $('[data-equalizer=' + value + ']').yukseklikEsitle();
    });
});

$(window).resize(function() {
	wh 	  = $(window).height();
	whtml = $(document).height();
	wraph = $('.wrapper').height();
	hdiff = wh - wraph;

	if ( hdiff > 0 ) {
		if ( $('.page_area').length ) {
			$('.page_area').css('min-height', $('.page_area').outerHeight() + hdiff);
		} else {
			$('.main').css('min-height', $('.main').outerHeight() + hdiff);
		}
	}

	if ( $('.wrapper').attr('class') != gridType ) {
		gridType = $('.wrapper').attr('class');

		$('.top_menu li').removeClass('active');
        $('.top_menu li > ul').hide();
	}
});

$(window).scroll(function() {
	if ( $(this).scrollTop() > $('.header').height() * 1.0 ) {
		$('.header').addClass('sticky');
		$('.left_menu').addClass('sticky');
	} else {
		$('.header').removeClass('sticky');
		$('.left_menu').removeClass('sticky');
	}

    if ($(this).scrollTop() > whtml / 10) {
        $('.scroll_up').fadeIn();
    } else {
        $('.scroll_up').fadeOut();
    }
});