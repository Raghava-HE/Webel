/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', "N/record", "N/url", 'N/redirect', 'N/task', 'N/runtime', 'N/search', 'N/http', 'N/format'], function (serverWidget, record, url, redirect, task, runtime, search, http, format) {
    function onRequest(context) {
        try {
            if (context.request.method === 'GET') {
                var vend = context.request.parameters.vendor;
                var docNumber = context.request.parameters.docNumber;
                var form = serverWidget.createForm({
                    title: 'Vendor Payment'
                })
                var transactgroup = form.addFieldGroup({
                    id: 'transactgroup',
                    label: 'Transaction Information'
                });

                var vendor = form.addField({
                    id: 'custpage_vendor',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Vendor',
                    source: 'vendor',
                    container: 'transactgroup',
                });
                if (vend != null && vend != '') {
                    vendor.defaultValue = vend;
                }
                var account = form.addField({
                    id: 'custpage_accountfield',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Account',
                    container: 'transactgroup',
                });
                var accountSearchObj = search.create({
                    type: "account",
                    filters:
                        [
                            ["type", "anyof", "Bank"]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "name",
                                sort: search.Sort.ASC,
                                label: "Name"
                            }),
                        ]
                });
                var searchResultCount = accountSearchObj.runPaged().count;
                var accountSearchObjResult = accountSearchObj.run().getRange({ start: 0, end: 1000 });
                account.addSelectOption({
                    value: 1,
                    text: ''
                });
                if (accountSearchObjResult.length != 0) {
                    for (var i in accountSearchObjResult) {
                        account.addSelectOption({
                            value: accountSearchObjResult[i].id,
                            text: accountSearchObjResult[i].getValue('name')
                        });
                    }
                }
                var date = form.addField({
                    id: 'custpage_datefield',
                    type: serverWidget.FieldType.DATE,
                    label: 'Date',
                    container: 'transactgroup',
                });
                date.defaultValue = new Date()
                var department = form.addField({
                    id: 'custpage_markup_department',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Department',
                    source: 'department',
                    container: 'transactgroup',
                });
                var docNum = form.addField({
                    id: 'custpage_doc_num',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Document Number',
                    container: 'transactgroup',
                });
                if (docNumber != null || docNumber != '') {
                    docNum.defaultValue = docNumber
                }
                form.addSubmitButton({
                    label: 'Submit'
                });
                var sublist = form.addSublist({
                    id: 'sublistid',
                    label: 'Payment Detail',
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
                var duedate = sublist.addField({
                    id: 'duedate',
                    label: 'Due Date',
                    type: serverWidget.FieldType.DATE,
                })
                duedate.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                var classi = sublist.addField({
                    id: 'type',
                    label: 'Type',
                    type: serverWidget.FieldType.TEXT
                })
                classi.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                var internalId = sublist.addField({
                    id: 'internalid',
                    label: 'Internal Id',
                    type: serverWidget.FieldType.TEXT,
                })
                internalId.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                })
                var placeOfSupply = sublist.addField({
                    id: 'placeofsupply',
                    label: 'Place of Supply',
                    type: serverWidget.FieldType.TEXT
                })
                placeOfSupply.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                var basis = sublist.addField({
                    id: 'documentnumber',
                    label: 'Document Number',
                    type: serverWidget.FieldType.TEXT,
                })
                basis.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                var origAmount = sublist.addField({
                    id: 'origamount',
                    label: 'Original Amount',
                    type: serverWidget.FieldType.FLOAT,
                })
                origAmount.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                var amountDue = sublist.addField({
                    id: 'amountdue',
                    label: 'Amount Due',
                    type: serverWidget.FieldType.FLOAT,
                })
                amountDue.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                var curren = sublist.addField({
                    id: 'currency',
                    label: 'Currency',
                    type: serverWidget.FieldType.SELECT,
                    source: 'currency'
                })
                curren.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                sublist.addField({
                    id: 'baseamount',
                    label: 'Base Amount',
                    type: serverWidget.FieldType.FLOAT
                })
                sublist.addField({
                    id: 'gsttds',
                    label: 'GST TDS',
                    type: serverWidget.FieldType.FLOAT,
                })
                sublist.addField({
                    id: 'gstwithheld',
                    label: 'GST Withheld',
                    type: serverWidget.FieldType.FLOAT
                })
                sublist.addField({
                    id: 'gstwithhelddocnum',
                    label: 'GST Withheld Document Number',
                    type: serverWidget.FieldType.TEXT
                })
                var finalAmount = sublist.addField({
                    id: 'final_amount',
                    label: 'Final Billable Amount',
                    type: serverWidget.FieldType.FLOAT
                })
                form.clientScriptModulePath = 'SuiteScripts/_xxflx_vendor_payment_cs.js';
                log.debug({
                    title: 'docNumber',
                    details: docNumber
                })
                log.debug({
                    title: 'vend',
                    details: vend
                })
                if ((vend != null && vend != '') && (docNumber == null || docNumber == '')) {
                    log.debug({
                        title: 'line 186'
                    })
                    var transactionSearchObj = search.create({
                        type: "transaction",
                        filters:
                            [
                                ["type", "anyof", "VendBill", "VendCred", "Journal"],
                                "AND",
                                ["name", "anyof", vend],
                                "AND",
                                ["mainline", "is", "T"],
                                "AND",
                                ["amountremaining", "greaterthan", "0.00"]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "internalid", label: "Internal ID" }),
                                search.createColumn({
                                    name: "duedate",
                                    sort: search.Sort.DESC,
                                    label: "Due Date/Receive By"
                                }),
                                search.createColumn({ name: "amount", label: "Amount" }),
                                search.createColumn({ name: "amountremaining", label: "Amount Remaining" }),
                                search.createColumn({ name: "amountpaid", label: "Amount Paid" }),
                                search.createColumn({ name: "currency", label: "Currency" }),
                                search.createColumn({ name: "type", label: "Type" }),
                                search.createColumn({ name: "tranid", label: "Document Number" }),
                                search.createColumn({ name: "custbody_xxflx_base_amount", label: "Base Amount" }),
                                search.createColumn({
                                    name: "formulatext",
                                    formula: "CASE WHEN {custbody_in_gst_pos} ='19-West Bengal' THEN 0 ELSE 1 END",
                                    label: "Formula (Text)"
                                })
                            ]
                    });
                    var searchResultCount = transactionSearchObj.runPaged().count;
                    var internalId;
                    var dueDate;
                    var formatDate;
                    var formatDate1;
                    var amount = 0;
                    var amountRemaining = 0;
                    var baseAmount = 0;
                    var currency = 0;
                    var tranId;
                    var type;
                    var k = 0;
                    var supply;
                    var columns = transactionSearchObj.columns
                    log.debug("transactionSearchObj result count", searchResultCount);
                    transactionSearchObj.run().each(function (result) {
                        internalId = result.getValue({
                            name: 'internalid'
                        })
                        tranId = result.getValue({
                            name: 'tranid'
                        })
                        log.debug("tranId", tranId);
                        type = result.getText({
                            name: 'type'
                        })
                        log.debug("type", type);
                        dueDate = result.getValue({
                            name: "duedate"
                        })
                        log.debug("dueDate result count", dueDate);
                        if(dueDate){
                            formatDate = format.format({
                                value: dueDate,
                                type: format.Type.DATE
                            })
                            formatDate1 = format.parse({
                                value: dueDate,
                                type: format.Type.DATE
                            })
                            log.debug("formatDate1 result count", formatDate1);
                            log.debug("formatDate result count", formatDate);
                        }
                        amount = result.getValue({
                            name: "amount",
                        })
                        amountRemaining = result.getValue({
                            name: "amountremaining"
                        })
                        amountPaid = result.getValue({
                            name: "amountpaid"
                        })
                        currency = result.getValue({
                            name: "currency"
                        })
                        baseAmount = result.getValue({
                            name: "custbody_xxflx_base_amount"
                        })
                        supply = result.getValue({
                            name: columns[9]
                        })
                        if (tranId)
                            sublist.setSublistValue({
                                id: 'documentnumber',
                                line: k,
                                value: tranId,
                            });
                        if (baseAmount)
                            sublist.setSublistValue({
                                id: 'baseamount',
                                line: k,
                                value: baseAmount,
                            });
                        sublist.setSublistValue({
                            id: 'internalid',
                            line: k,
                            value: internalId,
                        });
                        sublist.setSublistValue({
                            id: 'type',
                            line: k,
                            value: type,
                        });
                        if(formatDate){
                            sublist.setSublistValue({
                                id: 'duedate',
                                line: k,
                                value: formatDate,
                            });
                        }
                        sublist.setSublistValue({
                            id: 'origamount',
                            line: k,
                            value: amount,
                        });
                        sublist.setSublistValue({
                            id: 'amountdue',
                            line: k,
                            value: amountRemaining
                        });
                        sublist.setSublistValue({
                            id: 'currency',
                            line: k,
                            value: currency
                        });
                        sublist.setSublistValue({
                            id: 'placeofsupply',
                            line: k,
                            value: supply,
                        });
                        k++;
                        return true;
                    });
                }
                if ((vend != null && vend != '') && (docNumber != null && docNumber != '')) {
                    var transactionSearchObj = search.create({
                        type: "transaction",
                        filters:
                            [
                                ["type", "anyof", "VendBill", "VendCred", "Journal"],
                                "AND",
                                ["name", "anyof", vend],
                                "AND",
                                ["mainline", "is", "T"],
                                "AND",
                                ["formulatext: {number}", "is", docNumber]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "internalid", label: "Internal ID" }),
                                search.createColumn({
                                    name: "duedate",
                                    sort: search.Sort.DESC,
                                    label: "Due Date/Receive By"
                                }),
                                search.createColumn({ name: "amount", label: "Amount" }),
                                search.createColumn({ name: "amountremaining", label: "Amount Remaining" }),
                                search.createColumn({ name: "amountpaid", label: "Amount Paid" }),
                                search.createColumn({ name: "currency", label: "Currency" }),
                                search.createColumn({ name: "type", label: "Type" }),
                                search.createColumn({ name: "tranid", label: "Document Number" }),
                                search.createColumn({ name: "custbody_xxflx_base_amount", label: "Base Amount" }),
                                search.createColumn({
                                    name: "formulatext",
                                    formula: "CASE WHEN {custbody_in_gst_pos} ='19-West Bengal' THEN 0 ELSE 1 END",
                                    label: "Formula (Text)"
                                })
                            ]

                    });
                    var searchResultCount = transactionSearchObj.runPaged().count;
                    var internalId;
                    var dueDate;
                    var formatDate;
                    var formatDate1;
                    var amount = 0;
                    var amountRemaining = 0;
                    var baseAmount = 0;
                    var currency = 0;
                    var tranId;
                    var type;
                    var supply;
                    var k = 0;
                    log.debug("transactionSearchObj result count", searchResultCount);
                    var columns = transactionSearchObj.columns
                    transactionSearchObj.run().each(function (result) {
                        internalId = result.getValue({
                            name: 'internalid'
                        })
                        tranId = result.getValue({
                            name: 'tranid'
                        })
                        log.debug("tranId", tranId);
                        type = result.getText({
                            name: 'type'
                        })
                        log.debug("type", type);
                        dueDate = result.getValue({
                            name: "duedate"
                        })
                        log.debug("dueDate result count", dueDate);
                        if(dueDate){
                            formatDate = format.format({
                                value: dueDate,
                                type: format.Type.DATE
                            })
                            formatDate1 = format.parse({
                                value: dueDate,
                                type: format.Type.DATE
                            })
                        }
                        // log.debug("formatDate1 result count", formatDate1);
                        // log.debug("formatDate result count", formatDate);
                        amount = result.getValue({
                            name: "amount",
                        })
                        amountRemaining = result.getValue({
                            name: "amountremaining"
                        })
                        amountPaid = result.getValue({
                            name: "amountpaid"
                        })
                        currency = result.getValue({
                            name: "currency"
                        })
                        baseAmount = result.getValue({
                            name: "custbody_xxflx_base_amount"
                        })
                        supply = result.getValue({
                            name: columns[9]
                        })
                        if (tranId)
                            sublist.setSublistValue({
                                id: 'documentnumber',
                                line: k,
                                value: tranId,
                            });
                        if (baseAmount)
                            sublist.setSublistValue({
                                id: 'baseamount',
                                line: k,
                                value: baseAmount,
                            });
                        sublist.setSublistValue({
                            id: 'type',
                            line: k,
                            value: type,
                        });
                        if(formatDate){
                            sublist.setSublistValue({
                                id: 'duedate',
                                line: k,
                                value: formatDate,
                            });
                        }
                        sublist.setSublistValue({
                            id: 'origamount',
                            line: k,
                            value: amount,
                        });
                        sublist.setSublistValue({
                            id: 'amountdue',
                            line: k,
                            value: amountRemaining
                        });
                        sublist.setSublistValue({
                            id: 'currency',
                            line: k,
                            value: currency
                        });
                        sublist.setSublistValue({
                            id: 'placeofsupply',
                            line: k,
                            value: supply,
                        });
                        k++;
                        return true;
                    });
                }
                context.response.writePage(form);
            }
            else {
                var vendor = context.request.parameters.custpage_vendor;
                var accountField = context.request.parameters.custpage_accountfield;
                var sysDate = context.request.parameters.custpage_datefield;
                log.debug({
                    title: 'sysDate',
                    details: sysDate
                })
                var recObj = record.create({
                    type: record.Type.VENDOR_PAYMENT,
                    isDynamic: true
                })
                recObj.setValue({
                    fieldId: 'entity',
                    value: vendor
                })
                recObj.setValue({
                    fieldId: 'account',
                    value: accountField
                })
                recObj.setText({
                    fieldId: 'trandate',
                    text: sysDate
                })
                var recLineCount = recObj.getLineCount({
                    sublistId: 'apply'
                })
                log.debug({
                    title: 'recLineCount',
                    details: recLineCount
                })
                var lineCount = context.request.getLineCount('sublistid');
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
                        var internalid = context.request.getSublistValue({
                            group: 'sublistid',
                            name: 'internalid',
                            line: i
                        });
                        log.debug({
                            title: "internalid",
                            details: internalid
                        })
                        var finalAmount = context.request.getSublistValue({
                            group: 'sublistid',
                            name: 'final_amount',
                            line: i
                        });
                        log.debug({
                            title: "finalAmount",
                            details: finalAmount
                        })
                        var gstTds = context.request.getSublistValue({
                            group: 'sublistid',
                            name: 'gsttds',
                            line: i
                        })
                        var gstWithheld = context.request.getSublistValue({
                            group: 'sublistid',
                            name: 'gstwithheld',
                            line: i
                        })
                        var gstWithhelddocNum = context.request.getSublistValue({
                            group: 'sublistid',
                            name: 'gstwithhelddocnum',
                            line: i
                        })
                        var supply = context.request.getSublistValue({
                            group: 'sublistid',
                            name: 'placeofsupply',
                            line: i
                        })

                        recObj.selectNewLine({
                            sublistId: 'recmachcustrecord_xxflx_payment_link'
                        })
                        recObj.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_xxflx_payment_link',
                            fieldId: 'custrecord_xxflx_entry_detail_bill',
                            value: internalid
                        })
                        recObj.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_xxflx_payment_link',
                            fieldId: 'custrecord_xxflx_details_gst_tds',
                            value: gstTds
                        })
                        recObj.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_xxflx_payment_link',
                            fieldId: 'custrecord_xxflx_details_gst_withheld',
                            value: gstWithheld
                        })
                        recObj.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_xxflx_payment_link',
                            fieldId: 'custrecord_xxflx_gst_withheld_doc_num',
                            value: gstWithhelddocNum
                        })
                        recObj.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_xxflx_payment_link',
                            fieldId: 'custrecordxxflx_place_of_supply',
                            value: supply
                        })
                        if (gstWithhelddocNum != "" || gstWithheld != "" || gstTds != "") {
                            recObj.commitLine({
                                sublistId: 'recmachcustrecord_xxflx_payment_link'
                            })
                        }
                        for (var j = 0; j < recLineCount; j++) {
                            var recInternalId = recObj.getSublistValue({
                                sublistId: 'apply',
                                fieldId: 'internalid',
                                line: j
                            })
                            log.debug({
                                title: "recInternalId",
                                details: recInternalId
                            })
                            if (internalid == recInternalId) {
                                log.debug({
                                    title: "inside if"
                                })
                                recObj.selectLine({
                                    sublistId: 'apply',
                                    line: j
                                })
                                recObj.setCurrentSublistValue({
                                    sublistId: 'apply',
                                    fieldId: 'apply',
                                    value: true
                                })
                                recObj.setCurrentSublistValue({
                                    sublistId: 'apply',
                                    fieldId: 'amount',
                                    value: finalAmount
                                })
                                recObj.commitLine({
                                    sublistId: 'apply'
                                })
                            }
                        }
                    }
                }
                var id = recObj.save()
                redirect.toRecord({
                    id: id,
                    type: record.Type.VENDOR_PAYMENT
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