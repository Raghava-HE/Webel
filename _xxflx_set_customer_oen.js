/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
define(['N/currentRecord', 'N/search', 'N/format'], function (currentRecord, search, format) {
    function fieldChanged(context) {
        try {
            if (context.fieldId == 'custbody_xxflx_oen_reg_number') {
                var rec = context.currentRecord
                var oenRegId = rec.getValue({
                    fieldId: 'custbody_xxflx_oen_reg_number'
                })
                if (oenRegId) {
                    var fieldLookUp = search.lookupFields({
                        type: 'customrecord_xxflx_oen_registration',
                        id: oenRegId,
                        columns: ['custrecord_xxflx_oen_reg_customer_name', 'custrecord_xxflx_oen_reg_project_manager', 'custrecord_xxflx_oen_reg_date','custrecord_xxflx_oen_reg_work_order_numb']
                    });
                    var customer = fieldLookUp.custrecord_xxflx_oen_reg_customer_name[0].value;
                    var projectManager = fieldLookUp.custrecord_xxflx_oen_reg_project_manager[0].value;
                    var regDate = fieldLookUp.custrecord_xxflx_oen_reg_date;
                    var workOrderNumber = fieldLookUp.custrecord_xxflx_oen_reg_work_order_numb;
                    var formatDate = format.parse({
                        value: regDate,
                        type: format.Type.DATE
                    })
                    rec.setValue({
                        fieldId: 'entity',
                        value: customer
                    })
                    rec.setValue({
                        fieldId: 'custbody_xxflx_project_manager',
                        value: projectManager
                    })
                    rec.setValue({
                        fieldId: 'custbody_oen_reg_date',
                        value: formatDate
                    })
                    rec.setValue({
                        fieldId: 'custbody_xxflx_customer_order_number',
                        value: workOrderNumber
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
    return {
        fieldChanged: fieldChanged
    }
});
