/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/currentRecord', 'N/search', 'N/record', 'N/url'], function (currentRecord, search, record, url) {
    function saveRecord(context) {
        try {
            var rec = currentRecord.get();
            var k=0;
            var lineCount = rec.getLineCount({
                sublistId: 'sublistid'
            })
            if (lineCount > 0) {
                for (var i = 0; i < lineCount; i++) {
                    var isChecked = rec.getSublistValue({
                        sublistId: 'sublistid',
                        fieldId: 'checklist',
                        line: i
                    });
                    if (isChecked == true) {
                        k++;
                    }
                }
            }
            if (k<1) 
            {
                alert("Please Select a Payment.");
                return false;
            }   
             return true;
        }
        catch (error) {
            log.debug
                ({
                    title: error.name,
                    details: error.message
                })
            // alert(error.message)
        }
    }
    function fieldChanged(context) {
        try {
            var rec = currentRecord.get();
            if (context.fieldId == 'custpage_vendor') {
                fetchBillDetails(context)
            }
            if (context.fieldId == 'custpage_doc_num') {
                fetchDocNum(context)
            }
            if (context.sublistId == 'sublistid' && context.fieldId == 'checklist') {
                var rec = currentRecord.get();
                var apply= rec.getCurrentSublistValue({
                    sublistId: 'sublistid',
                    fieldId: 'checklist'
                })
                if(apply == true){
                    var orignalAmount = rec.getCurrentSublistValue({
                        sublistId: 'sublistid',
                        fieldId: 'amountdue'
                    })
                    var gstWithHeld= rec.getCurrentSublistValue({
                        sublistId: 'sublistid',
                        fieldId: 'gstwithheld'
                    })
                    if(gstWithHeld){
                        gstWithHeld = gstWithHeld
                    }
                    else{
                        gstWithHeld = 0
                    }
                    var gstTds = rec.getCurrentSublistValue({
                        sublistId: 'sublistid',
                        fieldId: 'gsttds'
                    })
                    if(gstTds){
                        gstTds = gstTds
                    }
                    else{
                        gstTds = 0
                    }
                    var finalAmount = parseFloat(orignalAmount)-(parseFloat(gstTds)+parseFloat(gstWithHeld))
                    rec.setCurrentSublistValue({
                        sublistId: 'sublistid',
                        fieldId:'final_amount',
                        value: finalAmount,
                    })
                }
                if(apply == false){
                    rec.setCurrentSublistValue({
                        sublistId: 'sublistid',
                        fieldId:'final_amount',
                        value: '',
                    })
                }
            }
            if (context.sublistId == 'sublistid' && context.fieldId == 'gsttds') {
                var rec = currentRecord.get();
                var apply= rec.getCurrentSublistValue({
                    sublistId: 'sublistid',
                    fieldId: 'checklist'
                })
                if(apply == true){
                    var orignalAmount = rec.getCurrentSublistValue({
                        sublistId: 'sublistid',
                        fieldId: 'amountdue'
                    })
                    var gstTds = rec.getCurrentSublistValue({
                        sublistId: 'sublistid',
                        fieldId: 'gsttds'
                    })
                    var gstWithHeld = rec.getCurrentSublistValue({
                        sublistId: 'sublistid',
                        fieldId: 'gstwithheld'
                    })
                    if(gstWithHeld==""){
                        gstWithHeld = 0
                    }
                    var finalAmount = parseFloat(orignalAmount)-(parseFloat(gstTds)+parseFloat(gstWithHeld))
                    rec.setCurrentSublistValue({
                        sublistId: 'sublistid',
                        fieldId:'final_amount',
                        value: finalAmount,
                    })
                }
                if(apply == false){
                    rec.setCurrentSublistValue({
                        sublistId: 'sublistid',
                        fieldId:'final_amount',
                        value: '',
                    })
                }
            }
            if (context.sublistId == 'sublistid' && context.fieldId == 'gstwithheld') {
                var rec = currentRecord.get();
                var apply= rec.getCurrentSublistValue({
                    sublistId: 'sublistid',
                    fieldId: 'checklist'
                })
                if(apply == true){
                    var orignalAmount = rec.getCurrentSublistValue({
                        sublistId: 'sublistid',
                        fieldId: 'amountdue'
                    })
                    var  gstWithHeld= rec.getCurrentSublistValue({
                        sublistId: 'sublistid',
                        fieldId: 'gstwithheld'
                    })
                    var gstTds = rec.getCurrentSublistValue({
                        sublistId: 'sublistid',
                        fieldId: 'gsttds'
                    })
                    if(gstTds){
                        gstTds = gstTds
                    }
                    else{
                        gstTds = 0
                    }
                    var finalAmount = parseFloat(orignalAmount)-(parseFloat(gstTds)+parseFloat(gstWithHeld))
                    rec.setCurrentSublistValue({
                        sublistId: 'sublistid',
                        fieldId:'final_amount',
                        value: finalAmount,
                    })
                }
                if(apply == false){
                    rec.setCurrentSublistValue({
                        sublistId: 'sublistid',
                        fieldId:'final_amount',
                        value: '',
                    })
                }
            }
        } catch (error) {
            log.error({
                title: error.name,
                details: error.message
            })
        }
    }
    function fetchBillDetails(context) {
        try {
            var rec = currentRecord.get();
            var vendorID = rec.getValue('custpage_vendor');
            window.onbeforeunload = null;
            var suiteletURL = url.resolveScript({
                scriptId: 'customscript_xxflx_vendor_payment_sut',
                deploymentId: 'customdeploy_xxflx_vendor_payment_sut',
                params: {
                    'vendor': vendorID,
                }
            });
            window.open(suiteletURL, '_self');
        } catch (e) {
            log.debug(e.name, e.message);
        }
    }
    function fetchDocNum(context) {
        try {
            var rec = currentRecord.get();
            var docNum = rec.getValue('custpage_doc_num');
            var vendorID = rec.getValue('custpage_vendor');
            window.onbeforeunload = null;
            var suiteletURL = url.resolveScript({
                scriptId: 'customscript_xxflx_vendor_payment_sut',
                deploymentId: 'customdeploy_xxflx_vendor_payment_sut',
                params: {
                    'docNumber': docNum,
                    'vendor': vendorID,
                }
            });
            window.open(suiteletURL, '_self');
        } catch (e) {
            log.debug(e.name, e.message);
        }
    }
    function markAllOrders() {
        //alert("Mark All Initiated");
        var rec = currentRecord.get();
        var lc = rec.getLineCount({
            sublistId: 'sublistid'
        })
        log.debug('lc in mark All=>', lc);
        /*___________________________*/
        for (var j = 0; j < lc; j++) {
            rec.selectLine({
                sublistId: 'sublistid',
                line: j
            });
            rec.setCurrentSublistValue({
                sublistId: 'sublistid',
                fieldId: 'checklist',
                value: true
            });
            rec.commitLine({
                sublistId: 'sublistid'
            });
        }
    }

    function unmarkAllOrders() {
        // alert("Line 2439")
        var rec = currentRecord.get();
        var lc = rec.getLineCount({
            sublistId: 'sublistid'
        })
        log.debug('lc in unmark All=>', lc);
        //alert(lc)
        /*___________________________*/
        for (var j = 0; j < lc; j++) {
            rec.selectLine({
                sublistId: 'sublistid',
                line: j
            });
            rec.setCurrentSublistValue({
                sublistId: 'sublistid',
                fieldId: 'checklist',
                value: false
            });
            rec.commitLine({
                sublistId: 'sublist'
            });
        }
    }
    /*function fetchDetails(context) {
        try {
            var rec = currentRecord.get();
            var subsidiaryID = rec.getValue('custpage_subsidiaryfield');
            var locationID = rec.getValue('custpage_locationfield');
            var posting = rec.getValue('custpage_postfield');
            var fromSubs = rec.getValue('custpage_billable_subs');
            var markupVal = rec.getValue('custpage_markup_percent');
            var toLoc = rec.getValue('custpage_to_locationfield');
            window.onbeforeunload = null;
            var suiteletURL = url.resolveScript({
                scriptId: 'customscript_ic_cross_charge',
                deploymentId: 'customdeploy_ic_cross_charge',
                params: {
                    'subs': subsidiaryID,
                    'loc': locationID,
                    'posting': posting,
                    'toSubs': fromSubs,
                    'markupVal': markupVal,
                    'toloca': toLoc
                }
            });
            window.open(suiteletURL, '_self');
        } catch (e) {
            log.debug(e.name, e.message);
        }
    }*/
    return {
        saveRecord: saveRecord,
        fieldChanged: fieldChanged,
        markAllOrders: markAllOrders,
        unmarkAllOrders: unmarkAllOrders
    }
});
