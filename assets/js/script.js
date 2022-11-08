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
  errorMessage = "The field is required";


/**
 * -------------------------------------
 * 2. ON DOCUMENT READY
 * -------------------------------------
 */
fixHeight();

setTimeout(()=>{
  $('.step-box .loader-inline').addClass('d-none');
  $('.step-box-body').removeClass('d-none');
},800);


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
  $('.loader-div').addClass('active');
  //=== email field validated

  //== have to uncomment after test
  //sendOtp().done(function (result) {

  //    if (result) {
  //        $('.loader-div').removeClass('active');
  //        rootParent.removeClass('active');
  //        rootParent.closest('.step-box').find('.otp-wrapper').addClass('active');
  //    } else {
  //        return;
  //    }
  //});

  //== have to remove after test
  $('.loader-div').removeClass('active');
  rootParent.removeClass('active');
  rootParent.closest('.step-box').find('.otp-wrapper').addClass('active');
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
  //$('.loader-div').addClass('active');

  //otpVerification().done(function (response) {
  //    if (response.result) {
  //        if (response.isPersonExist) {
  //            console.log('person exist, loading..');

  //            reloadWithPerson(response.personKey);
  //        } else {
  //            console.log('person not exist');
  //            setTimeout(() => {
  //                self.closest('.step-details').find('.step-box').removeClass('active');
  //                $('.step-list-sidebar .step-list').removeClass('active');

  //                $('.step-box[data-step=' + stepNext + ']').addClass('active');
  //                $('.step-list-sidebar .step-list[data-step=' + stepCurrent + ']').addClass('completed');
  //                $('.step-list-sidebar .step-list[data-step=' + stepNext + ']').addClass('active');

  //                $('.step-box-foot').addClass('active');
  //                $('.loader-div').removeClass('active');
  //            }, 600);
  //        }
  //        $('.loader-div').removeClass('active');

  //    } else {

  //        if (!isVarified) {
  //            rootParent.find('.form-group').find('.error-message').remove();
  //            rootParent.find('.form-group').append('<p class="error-message text-danger">Wrong OTP!</p>');
  //            return;
  //        }
  //    }
  //});

  //== have to remove after test

  //$('.loader-div').addClass('active');

  setTimeout(() => {
    self.closest('.step-details').find('.step-box').removeClass('active');
    $('.step-list-sidebar .step-list').removeClass('active');

    $('.step-box[data-step=' + stepNext + ']').addClass('active');
    $('.step-list-sidebar .step-list[data-step=' + stepCurrent + ']').addClass('completed');
    $('.step-list-sidebar .step-list[data-step=' + stepNext + ']').addClass('active');

    $('.step-box-foot').addClass('active');
    $('.loader-div').removeClass('active');
  }, 600);
});

$(document).on('click', '.btn-navigation-js', function (e){
  e.preventDefault();
  let self = $(this),
    rootParent = $('.step-box.active'),
    stepCurrent = parseInt(rootParent.attr('data-step')),
    stepNext = stepCurrent + 1,
    stepPrev = stepCurrent - 1,
    stepBoxCount = $('.step-details .step-box').length,
    requiredFieldGroup = rootParent.find('.form-group.required-group');

  console.log(typeof stepBoxCount);

  //=== previous button click action
  if(self.attr('data-action')==='decrease'){
    loaderEnable(loaderDivClass);
    setTimeout(()=>{
      stepMovePrev(stepCurrent);
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
    submitTheForm();
    return;
  }

  setTimeout(()=>{
    if(stepNext>2){
      $('.step-details .btn-prev').css('display','inline-block');
    }

    self.closest('.step-details').find('.step-box').removeClass('active');
    $('.step-list-sidebar .step-list').removeClass('active');
    if(self.attr('data-action')==='increase'){
      $('.step-box[data-step='+stepNext+']').addClass('active');
      $('.step-list-sidebar .step-list[data-step='+stepCurrent+']').addClass('completed');
      $('.step-list-sidebar .step-list[data-step='+stepNext+']').addClass('active');
    }

    if(parseInt($('.step-box.active').attr('data-step'))===stepBoxCount) self.find('span').html(self.attr('data-submit-text'));

    $('.loader-div').removeClass('active');
  },600);
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
 * 5. EVENT LISTENER: KEYUP / BLUR
 * -------------------------------------
 */

$(document).on('keyup', '.form-group.required-group .form-control', function (e) {
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

  //=== FIELD VALIDATION
  singleValidation(self, self.closest('.form-group'),'field-invalid', 'field-validated', 'error-message', errorMessage);
});


/**
 * -------------------------------------
 * 6. EVENT LISTENER: CHANGE
 * -------------------------------------
 */
$(document).on('change', '.select-with-other-wrapper .form-control', function (){
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

$(document).on('change', '.radio-group input[type=radio]', function (){
  let self = $(this),
    membershipTypeKey = self.attr('data-membership-type-key'),
    productKey = self.attr('data-product-key'),
    amount = self.attr('data-amount'),
    membershipTypeSelector = self.attr('data-membership-type-selector'),
    productKeySelector = self.attr('data-product-key-selctor'),
    amountSelector = self.attr('data-amount-selector');

  $(membershipTypeSelector).val(membershipTypeKey);
  $(productKeySelector).val(productKey);
  $(amountSelector).val(amount);
});




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
  let headerHeight = parseFloat($('.header').css('height')),
    footerHeight = parseFloat($('.footer').css('height')),
    mainWrapperMarginTop = parseFloat($('.main-wrapper').css('margin-top')),
    mainWrapperMarginBottom = parseFloat($('.main-wrapper').css('margin-bottom')),
    heightToMinusReady = headerHeight + footerHeight + mainWrapperMarginTop + mainWrapperMarginBottom,
    heightToMinus = "calc(100vh - " + heightToMinusReady + "px)";
  $('.main-wrapper').css('min-height', heightToMinus);
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
    formControl.val()!==''?validationSuccess(paramObj):validationFailed(paramObj);
  }

  //=== ONLY NUMBER VALIDATION
  if(formControl.hasClass('validation-number')){
    if(formControl.data('length-min')){
      isNumber(formControl.val())&&formControl.val().length>=formControl.data('length-min')?validationSuccess(paramObj):validationFailed(paramObj);
    }

    if(formControl.data('length-max')){
      isNumber(formControl.val())&&formControl.val().length<=formControl.data('length-max')?validationSuccess(paramObj):validationFailed(paramObj);
    }

    if(formControl.data('length-min') && formControl.data('length-max')){
      isNumber(formControl.val()) && formControl.val().length>=formControl.data('length-min') && formControl.val().length<=formControl.data('length-max')?validationSuccess(paramObj):validationFailed(paramObj);
    }
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
function cardValidation(){
  let ccNumberSelector = document.querySelector('.cc-number'),
    cardType = Payment.fns.cardType(J.val(ccNumberSelector));
  //=== INVALID CARD TYPE
  if(!cardType){
    creditCardImageHolder.html("<img src='assets/images/unknown.png'>");
    return;
  }
  creditCardField.addClass(cardType);
  creditCardImageHolder.html("<img src='assets/images/" + cardType + ".png'>");
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
  $('.step-box[data-step='+stepCurrent+']').removeClass('active');
  $('.step-box[data-step='+(stepCurrent-1)+']').addClass('active');
  $('.step-list-sidebar .step-list[data-step='+stepCurrent+']').removeClass('active');
  $('.step-list-sidebar .step-list[data-step='+(stepCurrent-1)+']').addClass('active');
  if((stepCurrent-1)<2){
    $('.step-details .btn-prev').css('display','none');
  }
}
