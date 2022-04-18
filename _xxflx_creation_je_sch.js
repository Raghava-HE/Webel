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
                name: 'custscript_xxflx_record_id'
            })
            var recObj = record.load({
                type: record.Type.VENDOR_PAYMENT,
                id: recId,
                isDynamic: true
            })
            var vendor = recObj.getValue({
                fieldId: 'entity'
            })
            var tranDate = recObj.getText({
                fieldId: 'trandate'
            })
            var lineCount = recObj.getLineCount({
                sublistId: 'recmachcustrecord_xxflx_payment_link'
            })
            if (lineCount > 0) {
                for (var i = 0; i < lineCount; i++) {
                    if (runtime.getCurrentScript().getRemainingUsage() < 200) {
                        var taskId = rescheduleCurrentScript();
                        return;
                    }
                    var gstTds = recObj.getSublistValue({
                        sublistId: 'recmachcustrecord_xxflx_payment_link',
                        fieldId: 'custrecord_xxflx_details_gst_tds',
                        line: i
                    })
                    var gstWithHeldAmount = recObj.getSublistValue({
                        sublistId: 'recmachcustrecord_xxflx_payment_link',
                        fieldId: 'custrecord_xxflx_details_gst_withheld',
                        line: i
                    })
                    var gstWithHeldDocNumber = recObj.getSublistValue({
                        sublistId: 'recmachcustrecord_xxflx_payment_link',
                        fieldId: 'custrecord_xxflx_gst_withheld_doc_num',
                        line: i
                    })
                    var placeOfSupply = recObj.getSublistValue({
                        sublistId: 'recmachcustrecord_xxflx_payment_link',
                        fieldId: 'custrecordxxflx_place_of_supply',
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
                                value: 110
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'debit',
                                value: gstTds
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                value: vendor
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
                                value: 217
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'credit',
                                value: finalAmount
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                value: vendor
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
                                value: 218
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'credit',
                                value: finalAmount
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                value: vendor
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
                                value: 110
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'debit',
                                value: gstTds
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                value: vendor
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
                                value: 219
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'credit',
                                value: finalAmount
                            })
                            TdsjournalObj.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                value: vendor
                            })
                            TdsjournalObj.commitLine({
                                sublistId: 'line'
                            })
                        }
                        var tdsjournalId = TdsjournalObj.save()
                        recObj.selectLine({
                            sublistId: 'recmachcustrecord_xxflx_payment_link',
                            line: i
                        })
                        recObj.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_xxflx_payment_link',
                            fieldId: 'custrecord_xxflx_tds_journal',
                            value: tdsjournalId
                        })
                        recObj.commitLine({
                            sublistId: 'recmachcustrecord_xxflx_payment_link'
                        })
                    }
                    if (gstWithHeldAmount) {
                        var withheldJournalObj = record.create({
                            type: record.Type.JOURNAL_ENTRY,
                            isDynamic: true
                        })
                        withheldJournalObj.setText({
                            fieldId: 'trandate',
                            text: tranDate
                        })
                        if(gstWithHeldDocNumber)
                        withheldJournalObj.setValue({
                            fieldId: 'tranid',
                            value: gstWithHeldDocNumber
                        })
                        withheldJournalObj.selectNewLine({
                            sublistId: 'line'
                        })
                        withheldJournalObj.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: 110
                        })
                        withheldJournalObj.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            value: gstWithHeldAmount
                        })
                        withheldJournalObj.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'entity',
                        value: vendor
                    })
                        withheldJournalObj.commitLine({
                            sublistId: 'line'
                        })
                        withheldJournalObj.selectNewLine({
                            sublistId: 'line'
                        })
                        withheldJournalObj.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: 226
                        })
                        withheldJournalObj.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            value: gstWithHeldAmount
                        })
                        withheldJournalObj.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'entity',
                            value: vendor
                        })
                        withheldJournalObj.commitLine({
                            sublistId: 'line'
                        })
                        var withheldJournalId = withheldJournalObj.save()
                        recObj.selectLine({
                            sublistId: 'recmachcustrecord_xxflx_payment_link',
                            line: i
                        })
                        recObj.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_xxflx_payment_link',
                            fieldId: 'custrecord_xxflx_gst_withheld_journal',
                            value: withheldJournalId
                        })
                        recObj.commitLine({
                            sublistId: 'recmachcustrecord_xxflx_payment_link'
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
