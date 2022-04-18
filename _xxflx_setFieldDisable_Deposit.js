/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
 define(['N/currentRecord', 'N/search'], function (currentRecord, search) {

    function fieldChanged(context) {
        try {
            var rec = context.currentRecord;
            if (context.fieldId == 'custbody_xxflx_cgst_tds_receivable'||context.fieldId == 'custbody_xxflx_sgst_tds_receivable') {
                var cgstValue = rec.getValue({
                    fieldId: 'custbody_xxflx_cgst_tds_receivable'
                }) 
                var sgstValue = rec.getValue({
                    fieldId: 'custbody_xxflx_sgst_tds_receivable'
                }) 
                if(cgstValue){
                    var sgstField = rec.getField({
                        fieldId: 'custbody_xxflx_sgst_tds_receivable'
                    })
                    sgstField.isMandatory = true;
                }
                else{
                    var sgstField = rec.getField({
                        fieldId: 'custbody_xxflx_sgst_tds_receivable'
                    })
                    sgstField.isMandatory = false;
                }
                if(sgstValue){
                    var cgstField = rec.getField({
                        fieldId: 'custbody_xxflx_cgst_tds_receivable'
                    })
                    cgstField.isMandatory = true;
                }
                else{
                    var cgstField = rec.getField({
                        fieldId: 'custbody_xxflx_cgst_tds_receivable'
                    })
                    cgstField.isMandatory = false;
                }
                if(cgstValue || sgstValue){
                    var igstField = rec.getField({
                        fieldId: 'custbodyxflx_igst_tds_receivable'
                    })
                    igstField.isDisabled = true;
                }
                else{
                    var igstField = rec.getField({
                        fieldId: 'custbodyxflx_igst_tds_receivable'
                    })
                    igstField.isDisabled = false; 
                }
            }
            if (context.fieldId == 'custbodyxflx_igst_tds_receivable') {
                var igstValue = rec.getValue({
                    fieldId: 'custbodyxflx_igst_tds_receivable'
                }) 
                if(igstValue){
                    var cgstField = rec.getField({
                        fieldId: 'custbody_xxflx_cgst_tds_receivable'
                    })
                    cgstField.isDisabled = true;
                    var sgstField = rec.getField({
                        fieldId: 'custbody_xxflx_sgst_tds_receivable'
                    })
                    sgstField.isDisabled = true;
                }
                else{
                    var cgstField = rec.getField({
                        fieldId: 'custbody_xxflx_cgst_tds_receivable'
                    })
                    cgstField.isDisabled = false;
                    var sgstField = rec.getField({
                        fieldId: 'custbody_xxflx_sgst_tds_receivable'
                    })
                    sgstField.isDisabled = false;
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
