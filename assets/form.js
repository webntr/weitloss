$().ready(function() {
    var texts = {
        de: {
            no_name: 'Name ist nicht ausgefüllt',
            no_phone: 'Telefon ist nicht ausgefüllt',
            invalid_phone: 'Telefon ist falsch ausgefüllt',
            network: 'Netzwerkfehler, bitte prüfen Sie Ihre Internetverbindung',
            countryNumber: "49"
        },
        at: {
            no_name: 'Name ist nicht ausgefüllt',
            no_phone: 'Telefon ist nicht ausgefüllt',
            invalid_phone: 'Telefon ist falsch ausgefüllt',
            network: 'Netzwerkfehler, bitte prüfen Sie Ihre Internetverbindung',
            countryNumber: "43"
        },
        ro: {
            no_name: 'Cimpul a fost completat incorect "Nume/Prenume"',
            no_phone: 'Vă rugăm să completați câmpul "Telefon"',
            invalid_phone: 'Cimpul a fost completat incorect "Telefon"',
            network: 'Eroare de rețea, verificați conexiunea la internet',
            countryNumber: "40"
        },
        pl: {
            no_name: 'Imię nie jest zaznaczone',
            no_phone: 'Numer telefonu nie jest zaznaczony',
            invalid_phone: 'Numer telefonu nie jest zaznaczony prawidłowo',
            network: 'Błąd sieci, prosimy sprawdzić połączenie internetowe',
            countryNumber: "48"
        },
        es: {
            no_name: 'Nombre no está lleno',
            no_phone: 'El teléfono no está lleno',
            invalid_phone: 'El teléfono está lleno incorrectamente',
            network: 'Error de red, verifique su conexión a internet',
            countryNumber: "34"
        }
    };

    $('.js_submit').click(function(e) {
        e.preventDefault();

        hideErrorMessage();
        checkForm($(this).parents('form'));

        return false;
    });

    function checkForm(form) {
        var nameElement = form.find('[name="name"]');
        var phoneElement = form.find('[name="phone"]');
        var countryElement = form.find('[name="country"]');
        var submitBtn = form.find('.js_submit');

        var countryCode = countryElement.val();

        var localizedTexts = texts[countryCode.toLowerCase()];
        if (!localizedTexts) {
            alert('not found localization for ' + countryCode);
            return;
        }

        var name = nameElement.val().trim();
        var phone = getPhoneNumberWithoutCountryCode(phoneElement.val(), localizedTexts.countryNumber);

        if (name.length === 0) {
            showErrorMessage(nameElement, localizedTexts.no_name);
            return;
        } else if (phone.length < 7) {
            showErrorMessage(phoneElement, localizedTexts.no_phone);
            return;
        }

        // validate phone numbers
        showBtnLoader(submitBtn);
        $.ajax({
            url: '../../validate-phone.php',
            type: 'get',
            data: {
                phone_number: phone,
                country_code: countryCode
            },
            success: function(response) {
                hideBtnLoader(submitBtn);

                if (!response) {
                    form.submit();
                    return;
                }

                if (response.hasOwnProperty('valid')) {
                    if (!response.valid) {
                        showErrorMessage(phoneElement, localizedTexts.invalid_phone);
                    } else {
                        if (response.international_format && response.international_format.length > 0) {
                            phoneElement.val(response.international_format);
                        }
                        form.submit();
                    }
                } else {
                    form.submit();
                }
            },
            error: function(error) {
                hideBtnLoader(submitBtn);
                showErrorMessage(phoneElement, localizedTexts.network);
            }
        });
    }

    function getPhoneNumberWithoutCountryCode(phone, countryNumber) {
        // оставляем только цифры в номере
        phone = phone.replace(/\D/g,'');

        // удаляем нули в начале
        while (phone.startsWith("0")) {
            phone = phone.substring(1);
        }

        // удаляем country number
        if (phone.startsWith(countryNumber)) {
            phone = phone.substring(countryNumber.length);
        }

        return phone;
    }

    function showBtnLoader(button) {
        button.attr('disabled', true);
        button.find('span').css({'visibility': 'hidden'});
        button.append('<div class="loader"/>');
    }

    function hideBtnLoader(button) {
        button.attr('disabled', false);
        button.find('span').css({'visibility': 'visible'});
        button.find('div.loader').remove();
    }

    function showErrorMessage(elem, msg) {
        hideErrorMessage();

        jQuery('<div class="js_errorMessage">' + msg + '</div>').appendTo('body').css({
            'left': jQuery(elem).offset().left,
            'top': jQuery(elem).offset().top - 30,
            'background-color':'#e74c3c',
            'border-radius': '5px',
            'color': '#fff',
            'font-family': 'Arial',
            'font-size': '14px',
            'margin': '3px 0 0 0px',
            'padding': '6px 5px 5px',
            'position': 'absolute',
            'z-index': '9999'
        });

        jQuery(elem).focus();
    }

    function hideErrorMessage() {
        $('.js_errorMessage').remove();
    }
});
