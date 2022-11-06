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
