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


/**
 * -------------------------------------
 * 2. ON DOCUMENT READY
 * -------------------------------------
 */
fixHeight();


/**
 * -------------------------------------
 * 4. EVENT LISTENER: CLICK
 * -------------------------------------
 */

$(document).on('click', '.btn-navigation-js', function (e){
  e.preventDefault();
  let self = $(this),
    stepCurrent = parseInt(self.attr('data-step')),
    stepNext = stepCurrent + 1,
    stepPrev = stepCurrent - 1,
    stepBoxCount = $('.step-details .step-box').length;

  let consoleString = `step current: ${stepCurrent} | stepbox count: ${stepBoxCount}`;
  console.log(consoleString);
  if(stepCurrent === stepBoxCount){
    window.location.href="thank-you.html";
    return;
  }

  if(stepNext>1){
    $('.step-details .btn-prev').css('display','inline-block')
  }

  self.closest('.step-details').find('.step-box').removeClass('active');
  $('.step-list-sidebar .step-list').removeClass('active');
  $('.step-list-sidebar .step-list[data-step='+stepCurrent+']').addClass('completed');
  if(self.attr('data-action')==='increase'){
    self.closest('.step-details').find('.step-box[data-step='+stepNext+']').addClass('active');
    $('.step-list-sidebar .step-list[data-step='+stepNext+']').addClass('active');
  }

  if(self.attr('data-action')==='decrease'){
    self.closest('.step-details').find('.step-box[data-step='+stepPrev+']').addClass('active');
    $('.step-list-sidebar .step-list[data-step='+stepPrev+']').removeClass('completed');
    $('.step-list-sidebar .step-list[data-step='+stepPrev+']').addClass('active');
  }
  self.attr('data-step', stepNext);
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

setTimeout(()=>{
  $('.step-box .loader-inline').addClass('d-none');
  $('.step-box-body').removeClass('d-none');
},800);
