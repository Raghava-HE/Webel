/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', "N/record", "N/url", 'N/redirect', 'N/task', 'N/runtime', 'N/search', 'N/http', 'N/format'], function (serverWidget, record, url, redirect, task, runtime, search, http, format) {
    function onRequest(context) {
        try {
            if (context.request.method === 'GET') {
                var docNum = context.request.parameters.oenNumber;
                var item = context.request.parameters.itemArr;
                log.debug({
                    title: 'item',
                    details: item
                })
                var itemArr = JSON.parse(item)
                log.debug({
                    title: 'itemArr',
                    details: itemArr
                })
                var qty= context.request.parameters.itemQty;
                var itemQty = JSON.parse(qty)
                log.debug({
                    title: 'itemQty',
                    details: itemQty
                })
                var vendorID = context.request.parameters.vendorId
                var form = serverWidget.createForm({
                    title: 'Purchase Enquiry'
                })
                var transactgroup = form.addFieldGroup({
                    id: 'transactgroup',
                    label: 'Transaction Information'
                });

                var oenNumber = form.addField({
                    id: 'custpage_oen_number',
                    type: serverWidget.FieldType.SELECT,
                    label: 'OEN Number',
                    source: 'salesorder',
                    container: 'transactgroup',
                });
                if (docNum != null && docNum != '') {
                    oenNumber.defaultValue = docNum;
                 }
                var vendor = form.addField({
                    id: 'custpage_vendor',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Vendor',
                    source: 'vendor',
                    container: 'transactgroup',
                });
                if (vendorID != null && vendorID != '') {
                    vendor.defaultValue = vendorID;
                 }
                form.addSubmitButton({
                    label: 'Submit'
                });
                var sublist = form.addSublist({
                    id: 'sublistid',
                    label: 'Item Details',
                    type: serverWidget.SublistType.INLINEEDITOR,
                })
                sublist.addButton({
                    id: 'markbuttonId',
                    label: 'Mark All',
                    functionName: 'markAllOrders'
                });
                sublist.addButton({
                    id: 'unmarkbuttonId',
                    label: 'Unmark All',
                    functionName: 'unmarkAllOrders'
                });
                sublist.addField({
                    id: 'checklist',
                    label: 'Apply',
                    type: serverWidget.FieldType.CHECKBOX
                })
                sublist.addField({
                    id: 'item',
                    label: 'Item',
                    type: serverWidget.FieldType.SELECT,
                    source: 'item'
                })
                sublist.addField({
                    id: 'itemqty',
                    label: 'Quantity',
                    type: serverWidget.FieldType.FLOAT
                })
                sublist.addField({
                    id: 'rate',
                    label: 'Rate',
                    type: serverWidget.FieldType.FLOAT
                })
                var amount = sublist.addField({
                    id: 'amount',
                    label: 'Amount',
                    type: serverWidget.FieldType.FLOAT
                })
                amount.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                for (var m = 0; m < itemArr.length; m++) {
                    if(vendorID){
                        sublist.setSublistValue({
                            id: 'checklist',
                            line: m,
                            value: 'F'
                        });
                        sublist.setSublistValue({
                            id: 'item',
                            line: m,
                            value: itemArr[m]
                        });
                        sublist.setSublistValue({
                            id: 'itemqty',
                            line: m,
                            value: itemQty[m]
                        });
                    }
                    else{
                        sublist.setSublistValue({
                            id: 'checklist',
                            line: m,
                            value: 'T'
                        });
                        sublist.setSublistValue({
                            id: 'item',
                            line: m,
                            value: itemArr[m]
                        });
                        sublist.setSublistValue({
                            id: 'itemqty',
                            line: m,
                            value: itemQty[m]
                        });
                    }
                }
                form.clientScriptModulePath = 'SuiteScripts/_xxflx_purchase_enquiry_notesheet_cs.js';
                context.response.writePage(form);
            }
            else {
                var oenNumber = context.request.parameters.custpage_oen_number;
                var vendor = context.request.parameters.custpage_vendor;
                var recObj = record.create({
                    type: 'customrecord_xxflx_purchase_enquiry'
                })
                recObj.setValue({
                    fieldId: 'custrecord_xxflx_purchase_enquiry_oen',
                    value: oenNumber
                })
                recObj.setValue({
                    fieldId: 'custrecord_xxflx_purchase_enquiry_vendor',
                    value: vendor
                })
                var lineCount = context.request.getLineCount('sublistid');
                var k=0;
                for (var i = 0; i < lineCount; i++) {
                    var receive = context.request.getSublistValue({
                        group: 'sublistid',
                        name: 'checklist',
                        line: i
                    });
                    log.debug({
                        title: "receive",
                        details: receive
                    })
                    if (receive == 'T') {
                        var item = context.request.getSublistValue({
                            group: 'sublistid',
                            name: 'item',
                            line: i
                        });
                        var itemQty = context.request.getSublistValue({
                            group: 'sublistid',
                            name: 'itemqty',
                            line: i
                        });
                        var rate = context.request.getSublistValue({
                            group: 'sublistid',
                            name: 'rate',
                            line: i
                        })
                        var amount = context.request.getSublistValue({
                            group: 'sublistid',
                            name: 'amount',
                            line: i
                        })
                        recObj.setSublistValue({
                            sublistId: 'recmachcustrecord_xxflx_purchase_enquiry_link',
                            fieldId: 'custrecord_xxflx_purchase_enquiry_item',
                            value: item,
                            line: k
                        })
                        recObj.setSublistValue({
                            sublistId: 'recmachcustrecord_xxflx_purchase_enquiry_link',
                            fieldId: 'custrecord_xxflx_purchase_enquiry_quant',
                            value: itemQty,
                            line: k
                        })
                        recObj.setSublistValue({
                            sublistId: 'recmachcustrecord_xxflx_purchase_enquiry_link',
                            fieldId: 'custrecord_xxflx_purchase_enquiry_rate',
                            value: rate,
                            line: k
                        })
                        recObj.setSublistValue({
                            sublistId: 'recmachcustrecord_xxflx_purchase_enquiry_link',
                            fieldId: 'custrecord_xxflx_purchase_enquiry_amount',
                            value: amount,
                            line: k
                        })
                        k++;
                    }
                }
                var id = recObj.save()
                redirect.toRecord({
                    id: id,
                    type: 'customrecord_xxflx_purchase_enquiry'
                })
            }
        } catch (error) {
            log.error({
                title: error.name,
                details: error.message
            })
        }
    }
    return {
        onRequest: onRequest
    };
});