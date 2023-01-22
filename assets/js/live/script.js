/**
 * 1. VARIABLES
 * 2. ON DOCUMENT READY
 * 3. EVENT LISTENER: FOCUS
 * 4. EVENT LISTENER: CLICK
 * 5. EVENT LISTENER: KEYUP / BLUR
 * 6. EVENT LISTENER: CHANGE
 * 7. FUNCTION DEFINITION
 */

/**
 * -------------------------------------
 * 1. VARIABLES
 * -------------------------------------
 */
let J = Payment.J,
  creditCardField = $('.cc-number'),
  creditCardHolder = $('.cc-number-holder'),
  creditCardImageHolder = $('.cc-card-identity'),
  loaderDivClass = '.loader-div',
  datePickerSelector = '.date-picker-js',
  formControlSelector = '.form-control',
  radioGroupSelector = '.radio-group',
  errorMessage = "The field is required";


/**
 * -------------------------------------
 * 2. ON DOCUMENT READY
 * -------------------------------------
 */
fixHeight();

//=== datepicker initialization
if($(datePickerSelector).length>0){
  $(datePickerSelector).datepicker({
    autoclose:true,
    startDate: new Date()
  });
  $(datePickerSelector).datepicker().on('changeDate', function(e) {
      $(this).trigger('blur');
  });

  $(datePickerSelector).datepicker().on('show', function(e) {
    $(this).closest('.form-group').find('.error-message').hide();
  });
}

/**
 * country/state/city api
 * https://countrystatecity.in/
 */
let headers = new Headers();
headers.append("X-CSCAPI-KEY", "dERvN2VIc3c3QTNXNDZRaXlHRUpOcVEyWHVyYzNOZk1KSG9TN2xmcw==");

let requestOptions = {
  method: 'GET',
  headers: headers,
  redirect: 'follow'
};

let countryHolderSelector = '.country-selector-holder-js';
let stateHolderSelector = '.state-selector-holder-js';
let cityHolderSelector = '.city-selector-holder-js';

let countrySelector = '.selector-country-js';
let countryInput = '.input-country-js';
let stateSelector = '.selector-state-js';
let stateInput = '.input-state-js';
let citySelector = '.selector-city-js';
let cityInput = '.input-city-js';

//=== fetch countries
fetch("https://api.countrystatecity.in/v1/countries", requestOptions)
  .then(response => response.text())
  .then(result =>{
    let objCountries = JSON.parse(result);
    if(objCountries.length<1) return;

    generateSelectDropdown(countryInput, 'selector-country-js', 'Select country');

    Object.keys(objCountries).forEach(function(key, index) {
      let countryNameShort = objCountries[key]['iso2'];
      let countryName = objCountries[key]['name'];
      $(countrySelector).append('<option value="'+countryNameShort+'">'+countryName+'</option>');
    });
    $(countryHolderSelector).closest('.select-box').find('.ajax-loader').hide();
  })
  .catch(error => {
    console.log('error', error);
  });



/**
 * -------------------------------------
 * 4. EVENT LISTENER: CLICK
 * -------------------------------------
 */

$(document).on('click', '.btn-send-otp-js', function (e) {
  e.preventDefault();
  let self = $(this),
    rootParent = self.closest('.email-wrapper'),
    requiredFieldGroup = rootParent.find('.form-group.required-group');

  requiredFieldGroup.each(function (i, element) {
    singleValidation($(element).find('.form-control'), $(element), 'field-invalid', 'field-validated', 'error-message', errorMessage);
  });

  if (rootParent.find('.form-group .form-control.invalid').length > 0) {
    rootParent.find('.form-group .form-control.invalid').first().focus();
    return;
  }

  //=== match email
  if(self.closest('.field-confirmation-wrapper-js')){
    if(self.closest('.field-confirmation-wrapper-js').find('.field-final-js').val() !== self.closest('.field-confirmation-wrapper-js').find('.field-initial-js').val()){
      errorMessage = "Email doesn't match!";
      let paramObj = {
        "formControl": self.closest('.field-confirmation-wrapper-js').find('.field-final-js'),
        "formGroup": self.closest('.field-confirmation-wrapper-js').find('.field-final-js').closest('.form-group'),
        "invalidClassName": 'field-invalid',
        "validClassName": 'field-validated',
        "errorMessageClassName": 'error-message',
        "errorMessage": errorMessage
      };
      validationFailed(paramObj);
      self.closest('.field-confirmation-wrapper-js').find('.field-final-js').focus();
      return;
    }
  }

  $('.loader-div').addClass('active');
  //=== email field validated

  //== have to uncomment after test
  sendOtp().done(function (result) {

    if (result) {
      $('.loader-div').removeClass('active');
      $('.alert-otp-js').removeClass('animate__headShake');
      setTimeout(function (){
        $('.alert-otp-js').addClass('animate__headShake');
      },100);
      rootParent.removeClass('active');
      rootParent.closest('.step-box').find('.otp-wrapper').addClass('active');
    } else {
      return;
    }
  });

});

$(document).on('click', '.btn-verify-otp-js', function (e) {
  e.preventDefault();
  let self = $(this),
    rootParent = self.closest('.otp-wrapper'),
    requiredFieldGroup = rootParent.find('.form-group.required-group'),
    stepCurrent = parseInt($('.step-box.active').attr('data-step')),
    stepNext = stepCurrent + 1,
    stepPrev = stepCurrent - 1;

  requiredFieldGroup.each(function (i, element) {
    singleValidation($(element).find('.form-control'), $(element), 'field-invalid', 'field-validated', 'error-message', errorMessage);
  });

  if (rootParent.find('.form-group .form-control.invalid').length > 0) {
    rootParent.find('.form-group .form-control.invalid').first().focus();
    return;
  }

  //=== otp verification
  //== have to uncomment after test
  $('.loader-div').addClass('active');

  otpVerification().done(function (response) {
    if (response.result) {
      if (response.isPersonExist) {
        console.log('person exist, loading..');

        reloadWithPerson(response.personKey);
      } else {
        console.log('person not exist');
        setTimeout(() => {
          self.closest('.step-details').find('.step-box').removeClass('active');
          $('.step-list-sidebar .step-list').removeClass('active');

          $('.step-box[data-step=' + stepNext + ']').addClass('active');
          $('.step-list-sidebar .step-list[data-step=' + stepCurrent + ']').addClass('completed');
          $('.step-list-sidebar .step-list[data-step=' + stepNext + ']').addClass('active');

          $('.step-box-foot').addClass('active');
          $('.loader-div').removeClass('active');
        }, 600);
      }
      $('.loader-div').removeClass('active');

    } else {
      rootParent.find('.form-group').find('.error-message').remove();
      rootParent.find('.form-group').append('<p class="error-message text-danger">Wrong verification code or expired!</p>');
      $('.loader-div').removeClass('active');
      return;
    }
  });

});

$(document).on('click', '.btn-navigation-js', function (e){
  e.preventDefault();
  let self = $(this),
    rootParent = $('.step-box.active'),
    stepCurrent = parseInt(rootParent.attr('data-step')),
    stepNext = stepCurrent + 1,
    stepPrev = stepCurrent - 1,
    stepBoxCount = $('.step-details .step-box').length,
    requiredFieldGroup = rootParent.find('.form-group.required-group'),
    paymentInfoSelector = '.payment-info-js',
    isPaymentConfirmSelector = '.is-payment-confirm';

  //=== payment form show/hide
  let amount = parseFloat($('.membership-amount-js').val()).toFixed(2);
  $(paymentInfoSelector).removeClass('d-none');
  $(paymentInfoSelector).find('.is-require').addClass('required-group');
  $(isPaymentConfirmSelector).removeClass('d-none');
  if(amount==='NaN' || amount<1){
    $(paymentInfoSelector).addClass('d-none');
    $(paymentInfoSelector).find('.is-require').removeClass('required-group');
    $(paymentInfoSelector).find('.is-require').removeClass('field-validated');
    $(paymentInfoSelector).find('.is-require .error-message').removeClass('required-group');
    $(paymentInfoSelector).find('.is-require input').removeClass('field-invalid invalid');
    $(paymentInfoSelector).find('.is-require select').removeClass('field-invalid invalid');
    $(paymentInfoSelector).find('.is-require input').removeClass('valid');
    $(paymentInfoSelector).find('.is-require select').removeClass('valid');

    $(isPaymentConfirmSelector).addClass('d-none');
  }

  //=== previous button click action
  if(self.attr('data-action')==='decrease'){
    loaderEnable(loaderDivClass);
    setTimeout(()=>{
      stepMovePrev(stepCurrent);
      if(stepPrev<3){
        $('.step-details .btn-prev').css('display','none');
      }
      if(parseInt($('.step-box.active').attr('data-step'))!==stepBoxCount) $('.btn-navigation-js[data-action=increase] span').html($('.btn-navigation-js[data-action=increase]').attr('data-text'));
      loaderDisable(loaderDivClass);
    },600);
    return;
  }

  requiredFieldGroup.each(function (i, element) {
    singleValidation($(element).find('.form-control'), $(element), 'field-invalid', 'field-validated', 'error-message', errorMessage);
  });

  if(rootParent.find('.form-group .form-control.invalid').length>0){
    rootParent.find('.form-group .form-control.invalid').first().focus();
    return;
  }

  loaderEnable(loaderDivClass);
  if(self.attr('data-action')==='increase' && stepCurrent === stepBoxCount){
    loaderDisable(loaderDivClass);
    $('#modal-confirm').modal('show');
    return;
  }

  setTimeout(()=>{
    stepMoveNext(stepCurrent);
    if(parseInt($('.step-box.active').attr('data-step'))===stepBoxCount) self.find('span').html(self.attr('data-submit-text'));
    loaderDisable(loaderDivClass);
  },600);
});

$(document).on('click', '.btn-edit-step-js', function (e){
  loaderEnable(loaderDivClass);
  setTimeout(()=>{
    stepMoveExact(parseInt($(this).attr('data-step')));
    if(parseInt($('.step-box.active').attr('data-step'))!==$('.step-details .step-box').length) $('.btn-navigation-js[data-action=increase] span').html($('.btn-navigation-js[data-action=increase]').attr('data-text'));
    loaderDisable(loaderDivClass);
  },600);
});

$(document).on('click', '.btn-confirm-js', function (e){
  $('#modal-confirm').modal('hide');
  loaderEnable(loaderDivClass);
  submitTheForm();
});

$(document).on('click', '.btn-apply-js', function (e){
  e.preventDefault();
  let self = $(this);
  $('.loader-div').addClass('active');
  setTimeout(()=>{
    $('.card-accordion').removeClass('active');
    window.scrollTo({
      top: $(".content-text").height() + $('.header').height(),
      behavior: 'smooth'
    });
    $('.step-form-wrapper').removeClass('d-none');
    self.closest('.btn-apply-wrapper').hide();
    $('.loader-div').removeClass('active');
  },600);
});

//=== accordion card toggle
$(document).on('click', '.card-accordion .card-header', function (e){
  let self = $(this);
  self.closest('.card-accordion').toggleClass('active');
});


/**
 * -------------------------------------
 * 5. EVENT LISTENER: KEYUP / BLUR / FOCUS / KEYPRESS
 * -------------------------------------
 */

$(document).on('keyup change', '.form-group.required-group .form-control', function (e) {
  let self = $(this);

  if(self.val().length>0){
    self.removeClass('invalid');
    self.removeClass('field-invalid');
    self.closest('.form-group').find('.error-message').remove();
  }
});

$(document).on('keyup', '.cc-number', function (e) {
  let self = $(this);
  let errorMessage = "The field is required";

  //=== FIELD VALIDATION
  singleValidation(self, self.closest('.form-group'),'field-invalid', 'field-validated', 'error-message', errorMessage);
});

$(document).on('blur', '.form-group.required-group .form-control', function (e) {
  let self = $(this);
  let errorMessage = "The field is required";

  if(self.hasClass('form-control-date')){
    setTimeout(()=>{
      singleValidation(self, self.closest('.form-group'),'field-invalid', 'field-validated', 'error-message', errorMessage);
    },100);
    return;
  }

  //=== FIELD VALIDATION
  singleValidation(self, self.closest('.form-group'),'field-invalid', 'field-validated', 'error-message', errorMessage);
});

//=== match email
$(document).on('blur', '.field-confirmation-wrapper-js .field-final-js', function (){
  let self = $(this);
  if(self.val() !== self.closest('.field-confirmation-wrapper-js').find('.field-initial-js').val()){
    errorMessage = "Email doesn't match!";
    let paramObj = {
      "formControl": self.closest('.field-confirmation-wrapper-js').find('.field-final-js'),
      "formGroup": self.closest('.field-confirmation-wrapper-js').find('.field-final-js').closest('.form-group'),
      "invalidClassName": 'field-invalid',
      "validClassName": 'field-validated',
      "errorMessageClassName": 'error-message',
      "errorMessage": errorMessage
    };
    validationFailed(paramObj);
  }
})

//=== allow only number
$(document).on('keypress', '.input-phone-number', function (e){
  if(e.which===45) return;
  if(e.which<48 || e.which>58) e.preventDefault();
});

//=== allow only positive number
$(document).on('keyup blur paste change', '.number-positive-js', function (e){
  let self = $(this);
  let result = isNumber(self.val())?'':self.val('');
})


/**
 * -------------------------------------
 * 6. EVENT LISTENER: CHANGE
 * -------------------------------------
 */
$(document).on('change', '.select-with-other-wrapper select.form-control', function (){
  let self = $(this);
  if(self.find(':selected').attr('data-action')==='other'){
    self.closest('.select-with-other-wrapper').find('.other-wrapper').removeClass('d-none')
  }else{
    self.closest('.select-with-other-wrapper').find('.other-wrapper .form-control').val('');
    self.closest('.select-with-other-wrapper').find('.other-wrapper .form-control').removeClass('invalid');
    self.closest('.select-with-other-wrapper').find('.other-wrapper .error-message').remove();
    self.closest('.select-with-other-wrapper').find('.other-wrapper').addClass('d-none');
  }
});


//=== radio field validation
$(document).on('change', '.radio-group input[type=radio]', function (){
  let self = $(this);
  radioInputCustom(self);
})

if($('.radio-group input[type=radio]').length>0){
  $('.radio-group input[type=radio]').each(function (i, selector){
    if(!$(selector).attr('checked') || $(selector).attr('checked') === "undefined") return;
    radioInputCustom($(selector));
  })
}

$(document).on('change', '.radio-group-membership input[type=radio]', function (){
  let self = $(this),
    membershipTypeKey = self.attr('data-membership-type-key'),
    productKey = self.attr('data-product-key'),
    amount = self.attr('data-amount'),
    dataFrequency = self.attr('data-freequency').toLowerCase(),
    membershipTypeSelector = self.attr('data-membership-type-selector'),
    productKeySelector = self.attr('data-product-key-selctor'),
    amountSelector = self.attr('data-amount-selector'),
    membershipName = self.attr('data-value'),
    autoRenewWrapperSelector = '.auto-renew-wrapper-js',
    donationWrapperSelector = '.donation-wrapper-js';

  $(autoRenewWrapperSelector).addClass('d-none');
  $('.auto-renew-wrapper-js input[type=checkbox]').prop('checked', false);

  if(dataFrequency === 'monthly' || dataFrequency === 'yearly'){
    $('.auto-renew-wrapper-js').removeClass('d-none');
  }

  $(membershipTypeSelector).val(membershipTypeKey);
  $(productKeySelector).val(productKey);
  $(amountSelector).val(amount);
  $('#modal-confirm .amount-to-authorize').html(amount);
  $('#modal-confirm .membership-name').html(membershipName);
});

$(document).on('change', '.check-group input[type=checkbox]', function (e){
  let self = $(this);
  if(self.prop('checked')){
    self.closest('.form-group').find('.form-control').val(self.attr('data-value'));
  }else{
    self.closest('.form-group').find('.form-control').val('');
  }

  if(self.closest('.form-group').hasClass('required-group')){
    singleValidation(self.closest('.form-group').find('.form-control'), self.closest('.form-group'), 'field-invalid', 'field-validated', 'error-message', errorMessage )
  }
});

//$(document).on('keyup paste blur', '.donation-amount-js', function (){
//  let self = $(this);
//  self.closest('.step-box').find('.membership-amount-js').val(self.val());
//})


// === on country selection
$(document).on('change', countrySelector, function (){
  let self = $(this);
  let selectedCountry = self.val();
  $(stateHolderSelector).closest('.select-box').find('.ajax-loader').show();
  $(stateSelector).empty();
  $(citySelector).empty();
  let url = `https://api.countrystatecity.in/v1/countries/${selectedCountry}/states`;
  //=== fetch states
  fetch(url, requestOptions)
    .then(response => response.text())
    .then(result => {
      let objStates = JSON.parse(result);
      if(objStates.length<1){
        replaceSelectWithInput(stateSelector, 'input-state-js');
        $(stateHolderSelector).closest('.select-box').find('.ajax-loader').hide();
        return;
      }

      generateSelectDropdown(stateInput, 'selector-state-js', 'Select State')
      Object.keys(objStates).forEach(function(key, index) {
        let stateNameShort = objStates[key]['iso2'];
        let stateName = objStates[key]['name'];
        $(stateSelector).append('<option value="'+stateNameShort+'">'+stateName+'</option>');
      });
      $(stateHolderSelector).closest('.select-box').find('.ajax-loader').hide();
    })
    .catch(error => {
      console.log('error', error);
    });
})

//=== on state selection
$(document).on('change', stateSelector, function (){
  let self = $(this);
  let selectedState = self.val();
  let selectedCountry = $('.selector-country-js').val();
  $(citySelector).empty();
  $(cityHolderSelector).closest('.select-box').find('.ajax-loader').show();
  let url = `https://api.countrystatecity.in/v1/countries/${selectedCountry}/states/${selectedState}/cities`;
  //=== fetch cities
  fetch(url, requestOptions)
    .then(response => response.text())
    .then(result => {
      let objCities = JSON.parse(result);
      if(objCities.length<1){
        replaceSelectWithInput(citySelector, 'input-city-js');
        $(cityHolderSelector).closest('.select-box').find('.ajax-loader').hide();
        return;
      }

      generateSelectDropdown(cityInput, 'selector-city-js', 'Select city');
      Object.keys(objCities).forEach(function(key, index) {
        let cityName = objCities[key]['name'];
        $(citySelector).append('<option value="'+cityName+'">'+cityName+'</option>');
      });
      $(cityHolderSelector).closest('.select-box').find('.ajax-loader').hide();
    })
    .catch(error => {
      console.log('error', error);
    });

})

$(document).on('select2:open', () => {
  document.querySelector('.select2-search__field').focus();
})




/**
 * -------------------------------------
 * 7. FUNCTION DEFINITION
 * -------------------------------------
 */

/**
 *
 * @effects gives body a min height so that the footer always stay in the bottom of the page
 * -------- event if the page doesn't have enough contents
 */
function fixHeight() {
  let headerHeight = parseFloat($('.header').outerHeight()),
    footerHeight = parseFloat($('.footer').outerHeight()),
    mainWrapperMarginTop = parseFloat($('.main-wrapper').css('margin-top')),
    mainWrapperMarginBottom = parseFloat($('.main-wrapper').css('margin-bottom')),
    heightToMinusReady = headerHeight + footerHeight + mainWrapperMarginTop + mainWrapperMarginBottom,
    heightToMinus = "calc(100vh - " + (headerHeight + footerHeight) + "px)";
  $('.main-wrapper').css('min-height', heightToMinus);
}


/**
 * inputs value in the hidden field when radio field is checked
 * @param self
 */
function radioInputCustom(self){
  self.closest(radioGroupSelector).find('.form-control').val(self.attr('data-value'));
  if(self.closest('.form-group').hasClass('required-group')){
    singleValidation(self.closest('.form-group').find('.form-control'), self.closest('.form-group'), 'field-invalid', 'field-validated', 'error-message', errorMessage )
  }
}


/**
 *
 * @param formControl
 * @param formGroup
 * @param invalidClassName
 * @param validClassName
 * @param errorMessageClassName
 * @param errorMessage
 *
 * @effects: check whether the input fields are validate
 * - or not and show warning message as needed
 */
function singleValidation(formControl, formGroup, invalidClassName, validClassName, errorMessageClassName, errorMessage) {
  //let consoleString = `self: ${formControl} | value: ${formControl.val()}`;
  errorMessage = "The field is required";
  let paramObj = {
    "formControl": formControl,
    "formGroup": formGroup,
    "invalidClassName": invalidClassName,
    "validClassName": validClassName,
    "errorMessageClassName": errorMessageClassName,
    "errorMessage": errorMessage
  };

  //=== IF FORM GROUP HAS DISPLAY NONE PROPERTIES
  if(formGroup.css('display')==='none') return;

  //=== INPUT FIELD VALIDATION: EMPTY FIELD
  if(formControl.val()===''){
    validationFailed(paramObj);
    return;
  }

  //=== INPUT FIELD VALIDATION: TEXT FIELD
  if(formControl.hasClass('validation-text')){
    paramObj.errorMessage="invalid input!";
    if(formControl.attr('data-min-length') && formControl.attr('data-max-length')){
      formControl.val().length>=formControl.attr('data-min-length') && formControl.val().length<=formControl.attr('data-max-length')?validationSuccess(paramObj):validationFailed(paramObj);
      return;
    }

    if(formControl.attr('data-min-length')){
      formControl.val().length>=formControl.attr('data-min-length')?validationSuccess(paramObj):validationFailed(paramObj);
      return;
    }

    if(formControl.attr('data-max-length')){
      formControl.val().length<=formControl.attr('data-max-length')?validationSuccess(paramObj):validationFailed(paramObj);
      return;
    }
    formControl.val()!==''?validationSuccess(paramObj):validationFailed(paramObj);
  }

  //=== ONLY NUMBER VALIDATION
  if(formControl.hasClass('validation-number')){
    paramObj.errorMessage="invalid input!";
    if(formControl.attr('data-min-length') && formControl.attr('data-max-length')){
      isNumber(formControl.val()) && formControl.val().length>=formControl.attr('data-min-length') && formControl.val().length<=formControl.attr('data-max-length')?validationSuccess(paramObj):validationFailed(paramObj);
      return;
    }

    if(formControl.attr('data-min-length')){
      isNumber(formControl.val())&&formControl.val().length>=formControl.attr('data-min-length')?validationSuccess(paramObj):validationFailed(paramObj);
      return;
    }

    if(formControl.attr('data-max-length')){
      isNumber(formControl.val())&&formControl.val().length<=formControl.attr('data-max-length')?validationSuccess(paramObj):validationFailed(paramObj);
      return;
    }
    isNumber(formControl.val())?validationSuccess(paramObj):validationFailed(paramObj);
  }

  //=== SELECT DROPDOWN VALIDATION
  if(formControl.prop('tagName')==='SELECT'){
    formControl.val()!==''?validationSuccess(paramObj):validationFailed(paramObj);
  }

  //=== INPUT FIELD VALIDATION: EMAIL FIELD
  if(formControl.hasClass('validation-email')){
    paramObj.errorMessage = "Invalid Email Address!";
    isEmailValid(formControl.val())?validationSuccess(paramObj):validationFailed(paramObj);
  }

  //=== INPUT FIELD VALIDATION: RADIO BOX
  if(formControl.hasClass('validation-radio')){
    formControl.val()!==''?validationSuccess(paramObj):validationFailed(paramObj);
  }

  //=== INPUT FIELD VALIDATION: CREDIT CARD NUMBER FIELD
  if(formControl.hasClass('validation-cc-number')){
    paramObj.errorMessage = "Invalid card number!";
    cardValidation()?validationSuccess(paramObj):validationFailed(paramObj);
  }
}

/**
 *
 * @param paramObj
 */
function validationFailed(paramObj) {
  paramObj.formGroup.removeClass(paramObj.validClassName);
  paramObj.formControl.addClass(paramObj.invalidClassName);
  paramObj.formControl.removeClass('valid');
  paramObj.formControl.addClass('invalid');

  notifyError(paramObj);
}

/**
 *
 * @param paramObj
 */
function validationSuccess(paramObj){
  paramObj.formControl.removeClass(paramObj.invalidClassName);
  paramObj.formControl.removeClass('invalid');
  paramObj.formControl.addClass('valid');
  paramObj.formGroup.addClass(paramObj.validClassName);
  paramObj.formGroup.find('.'+paramObj.errorMessageClassName).remove();
}

/**
 *
 * This function checks whether a given
 * - string is number or not
 *
 * @param string
 * @return {boolean}
 */
function isNumber(string){
  return /^\d+$/.test(string);
}

/**
 *
 * This function checks whether the given value is valid email or not
 * @param email
 * @return {boolean}
 */
function isEmailValid(email){
  return /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i.test(email);
}

/**
 * checks whether the given card number
 * - is valid or not
 *
 * @return {boolean}
 */
//The block is updated for server use
function cardValidation() {
  let ccNumberSelector = document.querySelector('.cc-number'),
    cardType = Payment.fns.cardType(J.val(ccNumberSelector));
  //=== INVALID CARD TYPE
  if (!cardType) {
    creditCardImageHolder.html("<img src='/Content/member-assets/images/unknown.png'>");
    return;
  }
  creditCardField.addClass(cardType);
  creditCardImageHolder.html("<img src='/Content/member-assets/images/" + cardType + ".png'>");
  return Payment.fns.validateCardNumber(J.val(ccNumberSelector));
}

/**
 *
 * @param paramObj [an oject containg all the parametes]
 * @effects shows error message for invalid field
 */
function notifyError(paramObj) {
  paramObj.formGroup.find('.'+paramObj.errorMessageClassName).remove();
  paramObj.formGroup.append('<p class="'+paramObj.errorMessageClassName+' text-danger">'+paramObj.errorMessage+'</p>');
  paramObj.formControl.closest('.form-group').find('.check-group').addClass('focused');
  setTimeout(()=>{
    paramObj.formControl.closest('.form-group').find('.check-group').removeClass('focused');
  },300);
}


/**
 * Enables Loader
 *
 * @param loaderDivSelector
 */
function loaderEnable(loaderDivSelector){
  $(loaderDivSelector).addClass('active');
}


/**
 * Disables loader
 *
 * @param loaderDivSelector
 */
function loaderDisable(loaderDivSelector){
  $(loaderDivSelector).removeClass('active');
}

/**
 * Moves step to the previous step
 *
 * @param stepCurrent
 */
function stepMovePrev(stepCurrent){
  $('.step-details .step-box').removeClass('active');
  $('.step-box[data-step='+(stepCurrent-1)+']').addClass('active');
  $('.step-list-sidebar .step-list').removeClass('active');
  $('.step-list-sidebar .step-list[data-step='+(stepCurrent-1)+']').addClass('active');
  if((stepCurrent-1)<2){
    $('.step-details .btn-prev').css('display','none');
  }
}

/**
 * Moves step to the next step
 *
 * @param stepCurrent
 */
function stepMoveNext(stepCurrent){
  if(stepCurrent>1){
    $('.step-details .btn-prev').css('display','inline-block');
  }
  $('.step-details .step-box').removeClass('active');
  $('.step-list-sidebar .step-list').removeClass('active');
  $('.step-box[data-step='+(stepCurrent+1)+']').addClass('active');
  $('.step-list-sidebar .step-list[data-step='+stepCurrent+']').addClass('completed');
  $('.step-list-sidebar .step-list[data-step='+(stepCurrent+1)+']').addClass('active');
}

/**
 * Moves step to the given step
 *
 * @param stepNumber
 */
function stepMoveExact(stepNumber){
  $('.step-details .step-box').removeClass('active');
  $('.step-box[data-step='+stepNumber+']').addClass('active');
  $('.step-list-sidebar .step-list').removeClass('active');
  $('.step-list-sidebar .step-list[data-step='+stepNumber+']').addClass('active');
  if((stepNumber)<3){
    $('.step-details .btn-prev').css('display','none');
  }
}

/**
 * Generates select dropdown
 * @param inputSelector
 * @param selectorClass
 * @param selectPlaceholder
 */
function generateSelectDropdown(inputSelector, selectorClass, selectPlaceholder){
  if($(inputSelector).length<1){
    $('.'+selectorClass).empty();
    $('.'+selectorClass).append('<option></option>');
    return;
  }
  let id = $(inputSelector).attr('id');
  let inputName = $(inputSelector).attr('name');
  let selector = `<select id="${id}" class="form-control field-normal selector-country ${selectorClass}" name="${inputName}">
                                        <option></option>
                                     </select>`;
  $(inputSelector).parent().html(selector);
  $(document).on('DOMNodeInserted', '.'+selectorClass, function () {
    $(this).select2({
      placeholder: selectPlaceholder,
    });
  });
}

/**
 * replaces select dropdown with input when ther is no item to add in the dropdown
 * @param selectSelector
 * @param inputClass
 */
function replaceSelectWithInput(selectSelector, inputClass){
  let id = $(selectSelector).attr('id');
  let name = $(selectSelector).attr('name');
  let inputField = `<input type="text" id="${id}" name="${name}" class="form-control field-normal ${inputClass}">`;
  $(selectSelector).parent().html(inputField);

}
