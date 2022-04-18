/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
 define(['N/runtime', 'N/record', 'N/search', 'N/task', 'N/file', 'N/format', 'N/redirect'], function (runtime, record, search, task, file, format, redirect) {
    function rescheduleCurrentScript() {
        var scheduledScriptTask = task.create({
            taskType: task.TaskType.SCHEDULED_SCRIPT
        });
        scheduledScriptTask.scriptId = runtime.getCurrentScript().id;
        scheduledScriptTask.deploymentId = runtime.getCurrentScript().deploymentId;
        return scheduledScriptTask.submit();
    }
    function execute(context) {
        try {
            var scriptObj = runtime.getCurrentScript();
            var recId = scriptObj.getParameter({
                name: 'custscript_xxflx_payment_record_id'
            })
            var recObj = record.load({
                type: record.Type.CUSTOMER_PAYMENT,
                id: recId,
                isDynamic: true
            })
            var customer = recObj.getValue({
                fieldId: 'customer'
            })
            var tranDate = recObj.getText({
                fieldId: 'trandate'
            })
            var lineCount = recObj.getLineCount({
                sublistId: 'recmachcustrecord_xxflx_customer_payment_link'
            })
            if (lineCount > 0) {
                for (var i = 0; i < lineCount; i++) {
                    if (runtime.getCurrentScript().getRemainingUsage() < 200) {
                        var taskId = rescheduleCurrentScript();
                        return;
                    }
                    var gstTds = recObj.getSublistValue({
                        sublistId: 'recmachcustrecord_xxflx_customer_payment_link',
                        fieldId: 'custrecord_xxflx_gst_tds_invoice',
                        line: i
                    })
                    var gstReceviableAmount = recObj.getSublistValue({
                        sublistId: 'recmachcustrecord_xxflx_customer_payment_link',
                        fieldId: 'custrecord_xxflx_tds_receviable',
                        line: i
                    })
                    var placeOfSupply = recObj.getSublistValue({
                        sublistId: 'recmachcustrecord_xxflx_customer_payment_link',
                        fieldId: 'custrecord_xxflx_place_of_supply_cust',
                        line: i
                    })
                    if (gstTds) {
                        if (placeOfSupply == '0') {
                            var finalAmount = (parseFloat(gstTds) / 2).toFixed(2)
                        }
                        else {
                            var finalAmount = parseFloat(gstTds).toFixed(2)
                        }
                        var TdsjournalObj = record.create({
                            type: record.Type.JOURNAL_ENTRY,
                            isDynamic: true
                        })
                        TdsjournalObj.setText({
                            fieldId: 'trandate',
                            text: tranDate
                        })
                        if (placeOfSupply == '0') {
                            TdsjournalObj.selectNewLine({
                                sublistId: 'line'
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                value: 220
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'debit',
                                value: finalAmount
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                value: customer
                            })
                            TdsjournalObj.commitLine({
                                sublistId: 'line'
                            })
                            TdsjournalObj.selectNewLine({
                                sublistId: 'line'
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                value: 221
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'debit',
                                value: finalAmount
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                value: customer
                            })
                            TdsjournalObj.commitLine({
                                sublistId: 'line'
                            })
                            TdsjournalObj.selectNewLine({
                                sublistId: 'line'
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                value: 120
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'credit',
                                value: gstTds
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                value: customer
                            })
                            TdsjournalObj.commitLine({
                                sublistId: 'line'
                            })
                        }
                        else {
                            TdsjournalObj.selectNewLine({
                                sublistId: 'line'
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                value: 222
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'debit',
                                value: gstTds
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                value: customer
                            })
                            TdsjournalObj.commitLine({
                                sublistId: 'line'
                            })
                            TdsjournalObj.selectNewLine({
                                sublistId: 'line'
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                value: 120
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'credit',
                                value: gstTds
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                value: customer
                            })
                            TdsjournalObj.commitLine({
                                sublistId: 'line'
                            })
                        }
                        var tdsjournalId = TdsjournalObj.save()
                        recObj.selectLine({
                            sublistId: 'recmachcustrecord_xxflx_customer_payment_link',
                            line: i
                        })
                        recObj.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_xxflx_customer_payment_link',
                            fieldId: 'custrecord_xxflx_customer_gst_tds_journa',
                            value: tdsjournalId
                        })
                        recObj.commitLine({
                            sublistId: 'recmachcustrecord_xxflx_customer_payment_link'
                        })
                    }
                    if (gstReceviableAmount) {
                        var receviableJournalObj = record.create({
                            type: record.Type.JOURNAL_ENTRY,
                            isDynamic: true
                        })
                        receviableJournalObj.setText({
                            fieldId: 'trandate',
                            text: tranDate
                        })
                        receviableJournalObj.selectNewLine({
                            sublistId: 'line'
                        })
                        receviableJournalObj.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: 1192
                        })
                        receviableJournalObj.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            value: gstReceviableAmount
                        })
                        receviableJournalObj.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'entity',
                        value: customer
                    })
                        receviableJournalObj.commitLine({
                            sublistId: 'line'
                        })
                        receviableJournalObj.selectNewLine({
                            sublistId: 'line'
                        })
                        receviableJournalObj.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: 120
                        })
                        receviableJournalObj.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            value: gstReceviableAmount
                        })
                        receviableJournalObj.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'entity',
                            value: customer
                        })
                        receviableJournalObj.commitLine({
                            sublistId: 'line'
                        })
                        var receviableJournaId = receviableJournalObj.save()
                        recObj.selectLine({
                            sublistId: 'recmachcustrecord_xxflx_customer_payment_link',
                            line: i
                        })
                        recObj.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_xxflx_customer_payment_link',
                            fieldId: 'custrecord_xxflx_tds_receviable_journal',
                            value: receviableJournaId
                        })
                        recObj.commitLine({
                            sublistId: 'recmachcustrecord_xxflx_customer_payment_link'
                        })
                    }
                }
            }
            recObj.save()
        } catch (error) {
            log.error({
                title: error.name,
                details: error.message
            })
        }
    }

    return {
        execute: execute
    }
});
