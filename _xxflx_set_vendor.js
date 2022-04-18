/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
define(['N/currentRecord', 'N/search', 'N/format'], function (currentRecord, search, format) {
    function fieldChanged(context) {
        try {
            if (context.fieldId == 'custbody_xxflx_notesheet_ref_num') {
                var rec = context.currentRecord
                var noteSheetId = rec.getValue({
                    fieldId: 'custbody_xxflx_notesheet_ref_num'
                })
                if (noteSheetId) {
                var fieldLookUp = search.lookupFields({
                    type: 'customrecord_xxflx_notesheet',
                    id: noteSheetId,
                    columns: ['custrecord_xxflx_oen_reg_vendor_name', 'custrecord_xxflx_ref_oen_num']
                });
                var vendor = fieldLookUp.custrecord_xxflx_oen_reg_vendor_name[0].value;
                var salesOrderNumber = fieldLookUp.custrecord_xxflx_ref_oen_num[0].value;
                var job = getProjectId(salesOrderNumber)
                    rec.setValue({
                        fieldId: 'entity',
                        value: vendor
                    })
                    rec.setValue({
                        fieldId: 'custbody_xxflx_oen_number',
                        value: salesOrderNumber
                    })
                }
            }
                if (context.sublistId == 'item' && context.fieldId == 'item') {
                    var rec = context.currentRecord
                    var salesOrderNumber = rec.getValue({
                        fieldId: 'custbody_xxflx_oen_number'
                    })
                    var job = getProjectId(salesOrderNumber)
                    rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'customer',
                        value: job
                    })
                }
        } catch (error) {
            log.error({
                title: error.name,
                details: error.message
            })
        }
    }
    function getProjectId(salesOrderNumber) {
        try {
            var salesorderSearchObj = search.create({
                type: "salesorder",
                filters:
                    [
                        ["type", "anyof", "SalesOrd"],
                        "AND",
                        ["internalidnumber", "equalto", salesOrderNumber],
                        "AND",
                        ["mainline", "is", "T"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            join: "jobMain",
                            label: "Internal ID"
                        })
                    ]
            });
            var searchResultCount = salesorderSearchObj.runPaged().count;
            log.debug("salesorderSearchObj result count", searchResultCount);
            var projectId;
            salesorderSearchObj.run().each(function (result) {
                projectId = result.getValue({
                    name: "internalid",
                    join: "jobMain",
                })
                return true;
            });
            return projectId;
        } catch (error) {
            log.debug({
                title: error.name,
                details: error.message
            })
        }
    }
    return {
        fieldChanged: fieldChanged
    }
});
