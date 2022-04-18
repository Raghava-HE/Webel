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
                alert("Please Select atleast one line item.");
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
                fetchOenDetails(context)
            }
            if (context.sublistId == 'sublistid' && context.fieldId == 'rate') {
                var rec = currentRecord.get();
                var rate= rec.getCurrentSublistValue({
                    sublistId: 'sublistid',
                    fieldId: 'rate'
                })
                var qty= rec.getCurrentSublistValue({
                    sublistId: 'sublistid',
                    fieldId: 'itemqty'
                })
                    var finalAmount = (parseFloat(rate)*parseFloat(qty)).toFixed(2)
                    rec.setCurrentSublistValue({
                        sublistId: 'sublistid',
                        fieldId:'amount',
                        value: finalAmount,
                    })
            }
        } catch (error) {
            log.error({
                title: error.name,
                details: error.message
            })
        }
    }
    function fetchOenDetails(context) {
        try {
            var recObj = currentRecord.get();
            var itemArr = [];
            var itemQty = [];
            var vendorID = recObj.getValue('custpage_vendor');
            var oenNumber = recObj.getValue('custpage_oen_number');
            var lineCount = recObj.getLineCount({
                sublistId: 'sublistid'
            })
            //alert(lineCount)
            for (var i = 0; i < lineCount; i++) {
                var item = recObj.getSublistValue({
                    sublistId: 'sublistid',
                    fieldId: 'item',
                    line: i
                })
               // alert(item)
                var qty = recObj.getSublistValue({
                    sublistId: 'sublistid',
                    fieldId: 'itemqty',
                    line: i
                })
                //alert(qty)
                itemArr.push(item);
                itemQty.push(qty);
            }
            window.onbeforeunload = null;
            var suiteletURL = url.resolveScript({
                deploymentId: 'customdeploy_xxflx_purchase_enquiry_sut',
                scriptId: 'customscript_xxflx_purchase_enquiry_sut',
                params: {
                    'oenNumber': oenNumber,
                    'vendorId':vendorID,
                    'itemArr': JSON.stringify(itemArr),
                    'itemQty': JSON.stringify(itemQty),
                }
            })
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
