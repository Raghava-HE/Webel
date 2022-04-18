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
            if (context.fieldId == 'custpage_customer') {
                fetchInvoiceDetails(context)
            }
           if (context.fieldId == 'custpage_docnum') {
                fetchDocNum(context)
            }
            if (context.fieldId == 'custpage_undeposited_fund') {
                var rec = currentRecord.get();
                var depValue = rec.getValue({
                    fieldId: 'custpage_undeposited_fund'
                })
                if(depValue == true){
                    var accountCheckField =rec.getField({
                        fieldId: 'custpage_accountcheck',
                    })
                    var accField = rec.getField({
                        fieldId: 'custpage_accountfield',
                    })
                    accountCheckField.isDisabled = true;
                    accField.isDisabled = true;
                }
                else{
                    var accountCheckField =rec.getField({
                        fieldId: 'custpage_accountcheck',
                    })
                    var accField = rec.getField({
                        fieldId: 'custpage_accountfield',
                    })
                    accountCheckField.isDisabled = false;
                    accField.isDisabled = false;
                }
            }
            if (context.fieldId == 'custpage_accountcheck') {
                var rec = currentRecord.get();
                var accValue = rec.getValue({
                    fieldId: 'custpage_accountcheck'
                })
                if(accValue == true){
                    var depCheckField =rec.getField({
                        fieldId: 'custpage_undeposited_fund',
                    })
                    var accField = rec.getField({
                        fieldId: 'custpage_accountfield',
                    })
                    depCheckField.isDisabled = true;
                    accField.isMandatory = true;
                }
                else{
                    var depCheckField =rec.getField({
                        fieldId: 'custpage_undeposited_fund',
                    })
                    var accField = rec.getField({
                        fieldId: 'custpage_accountfield',
                    })
                    depCheckField.isDisabled = false;
                    accField.isMandatory = false
                }
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
                        fieldId: 'tdsreceive'
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
                        fieldId: 'tdsreceive'
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
            if (context.sublistId == 'sublistid' && context.fieldId == 'tdsreceive') {
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
                        fieldId: 'tdsreceive'
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
    function fetchInvoiceDetails(context) {
        try {
            var rec = currentRecord.get();
            var customerID = rec.getValue('custpage_customer');
            window.onbeforeunload = null;
            var suiteletURL = url.resolveScript({
                scriptId: 'customscript_xxflx_customer_payment_sut',
                deploymentId: 'customdeploy_xxflx_customer_payment_sut',
                params: {
                    'customer': customerID,
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
            var docNum = rec.getValue('custpage_docnum');
            var customerID = rec.getValue('custpage_customer');
            window.onbeforeunload = null;
            var suiteletURL = url.resolveScript({
                scriptId: 'customscript_xxflx_customer_payment_sut',
                deploymentId: 'customdeploy_xxflx_customer_payment_sut',
                params: {
                    'docNumber': docNum,
                    'customer': customerID,
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
    return {
        saveRecord: saveRecord,
        fieldChanged: fieldChanged,
        markAllOrders: markAllOrders,
        unmarkAllOrders: unmarkAllOrders
    }
});
