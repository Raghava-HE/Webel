/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(["N/record", "N/log", "N/https", "N/search", "N/format", "N/http", "N/runtime", "N/ui/serverWidget", "N/error"], function (record, log, https, search, format, http, runtime, serverWidget, error) {

    function beforeLoad(context) {
        try {
            var parms = context.request.parameters;
            log.debug({
                title: 'parms',
                details: parms
            })
            if (parms) {
                var refNum = context.request.parameters.oen_ref_num
                log.debug({
                    title: 'refNum',
                    details: refNum
                })
                var approvalStatus = context.request.parameters.notesheet_approval_status;
                var date = context.request.parameters.notesheet_date;
                var item = context.request.parameters.notesheet_item;
                var qty = context.request.parameters.notesheet_qty;
                var projectManager = context.request.parameters.notesheet_project_manager
                var itemArr = JSON.parse(item)
                log.debug({
                    title: 'itemArr',
                    details: itemArr
                })
                var itemQty = JSON.parse(qty)
                log.debug({
                    title: 'itemQty',
                    details: itemQty
                })
                context.newRecord.setValue({
                    fieldId: 'custrecord_xxflx_project_manager',
                    value: projectManager,
                    ignoreFieldChange: true
                });
                context.newRecord.setValue({
                    fieldId: 'custrecord_xxflx_ref_oen_num',
                    value: refNum,
                    ignoreFieldChange: true
                });
                context.newRecord.setValue({
                    fieldId: 'custrecord_xxflx_approval_status',
                    value: approvalStatus,
                    ignoreFieldChange: true
                });
                context.newRecord.setValue({
                    fieldId: 'custrecord_xxflx_notesheet_date',
                    value: new Date(),
                    ignoreFieldChange: true
                });
                for (var m = 0; m < itemArr.length; m++) {
                    log.debug({
                        title: "inside loop"
                    })
                    context.newRecord.setSublistValue({
                        sublistId: 'recmachcustrecord_xxflx_notesheet_link',
                        fieldId: 'custrecord_xxflx_notesheet_child_item',
                        line: m,
                        value: itemArr[m]
                    })
                    context.newRecord.setSublistValue({
                        sublistId: 'recmachcustrecord_xxflx_notesheet_link',
                        fieldId: 'custrecord_xxflx_notesheet_child_qty',
                        line: m,
                        value: itemQty[m]
                    })

                }
            }
        }
        catch (e) {
            log.debug(e.name, e.message);
        }
    }
    function afterSubmit(context) {
        try {
            if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                var recId = context.newRecord.id;
                var mainObj = {};
                var vendorAmountObj = {};
                var uniqItem = [];
                log.debug({
                    title: 'recId is',
                    details: recId
                });
                var recObj = record.load({
                    type: 'customrecord_xxflx_notesheet',
                    id: recId,
                    isDynamic: true
                })
                var lineCount = recObj.getLineCount({
                    sublistId: 'recmachcustrecord_xxflx_notesheet_link'
                })
                for (var i = 0; i < lineCount; i++) {
                    var vendor = recObj.getSublistValue({
                        sublistId: 'recmachcustrecord_xxflx_notesheet_link',
                        fieldId: 'custrecord_xxflx_notesheet_child_vendor',
                        line: i
                    })
                    var amount = recObj.getSublistValue({
                        sublistId: 'recmachcustrecord_xxflx_notesheet_link',
                        fieldId: 'custrecord_xxflx_notesheet_child_amount',
                        line: i
                    })
                    if (!mainObj.hasOwnProperty(vendor)) {
                        mainObj[vendor] = {};
                        mainObj[vendor].vendor = vendor;
                        mainObj[vendor].amount = amount;
                    }
                    else {
                        mainObj[vendor].amount = parseFloat(parseFloat(mainObj[vendor].amount) + parseFloat(amount));
                    }
                }
                log.debug({
                    title: 'mainObj',
                    details: mainObj
                })
                for (prop in mainObj) {
                    var groupingObj = mainObj[prop]
                    var vendor = groupingObj.vendor;
                    var amount = groupingObj.amount;
                    vendorAmountObj = {};
                    vendorAmountObj = {
                        vendor: vendor,
                        amount: amount
                    }
                    uniqItem.push(vendorAmountObj)
                }
                log.debug({
                    title: 'uniqItem',
                    details: uniqItem
                })
                var maxelement = uniqItem[0].amount
                var prefVendor = uniqItem[0].vendor
                for (var index = 0; index < uniqItem.length; index++) {
                    if(uniqItem[index].amount<maxelement){
                        maxelement = uniqItem[index].amount
                        prefVendor = uniqItem[index].vendor
                    }
                }
                log.debug({
                    title: 'prefVendor',
                    details: prefVendor
                })
                recObj.setValue({
                    fieldId: 'custrecord_xxflx_oen_reg_vendor_name',
                    value: prefVendor
                })
                recObj.save()
            }
        } catch (error) {
            log.error({
                title: error.name,
                details: error.message
            })
        }
    }

    return {
        beforeLoad: beforeLoad,
        afterSubmit: afterSubmit
    }
});
