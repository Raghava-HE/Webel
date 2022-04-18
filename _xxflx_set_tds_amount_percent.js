/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/currentRecord', 'N/search'], function (currentRecord, search) {

    function fieldChanged(context) {
        try {
            var rec = context.currentRecord;
            if (context.fieldId == 'custbody_xxflx_tax_sextion_code') {
                var tdsCode = rec.getValue({
                    fieldId: 'custbody_xxflx_tax_sextion_code'
                })
                if(tdsCode){
                    var tdsTextCode = rec.getText({
                        fieldId: 'custbody_xxflx_tax_sextion_code'
                    })
                    if(tdsTextCode){
                        var tdsAccId = getAccountId(tdsTextCode)
                        if(tdsAccId){
                            rec.setValue({
                                fieldId: 'custbody_xxflx_tds_account',
                                value: tdsAccId
                            })
                        }
                    }
                    var lookupFields = search.lookupFields({
                        type: 'customrecord_in_tds_setup',
                        id: tdsCode,
                        columns: ['custrecord_in_tds_setup_rate']
                    })
                    var ratePercent = lookupFields.custrecord_in_tds_setup_rate
                    var x = ratePercent.split('%')
                    var dec = x[0]
                    rec.setValue({
                        fieldId: 'custbody_xxflx_tds_percent',
                        value: dec
                    })
                    var paymentAmount = rec.getValue({
                        fieldId: 'payment'
                    })
                    var tdsAmount = (parseFloat(paymentAmount)*parseFloat(dec))/100
                    rec.setValue({
                        fieldId: 'custbody_xxflx_tds_amount',
                        value: tdsAmount
                    })
                }
                else{
                    rec.setValue({
                        fieldId: 'custbody_xxflx_tds_percent',
                        value: ''
                    })
                    rec.setValue({
                        fieldId: 'custbody_xxflx_tds_amount',
                        value: ''
                    })
                }
            }
            if (context.fieldId == 'custbody_xxflx_cgst_tds_payable'||context.fieldId == 'custbody_xxflx_sgst_tds_payable') {
                var cgstValue = rec.getValue({
                    fieldId: 'custbody_xxflx_cgst_tds_payable'
                }) 
                var sgstValue = rec.getValue({
                    fieldId: 'custbody_xxflx_sgst_tds_payable'
                }) 
                if(cgstValue){
                    var sgstField = rec.getField({
                        fieldId: 'custbody_xxflx_sgst_tds_payable'
                    })
                    sgstField.isMandatory = true;
                }
                else{
                    var sgstField = rec.getField({
                        fieldId: 'custbody_xxflx_sgst_tds_payable'
                    })
                    sgstField.isMandatory = false;
                }
                if(sgstValue){
                    var cgstField = rec.getField({
                        fieldId: 'custbody_xxflx_cgst_tds_payable'
                    })
                    cgstField.isMandatory = true;
                }
                else{
                    var cgstField = rec.getField({
                        fieldId: 'custbody_xxflx_cgst_tds_payable'
                    })
                    cgstField.isMandatory = false;
                }
                if(cgstValue || sgstValue){
                    var igstField = rec.getField({
                        fieldId: 'custbody_xxflx_igst_tds_payable'
                    })
                    igstField.isDisabled = true;
                }
                else{
                    var igstField = rec.getField({
                        fieldId: 'custbody_xxflx_igst_tds_payable'
                    })
                    igstField.isDisabled = false; 
                }
            }
            if (context.fieldId == 'custbody_xxflx_igst_tds_payable') {
                var igstValue = rec.getValue({
                    fieldId: 'custbody_xxflx_igst_tds_payable'
                }) 
                if(igstValue){
                    var cgstField = rec.getField({
                        fieldId: 'custbody_xxflx_cgst_tds_payable'
                    })
                    cgstField.isDisabled = true;
                    var sgstField = rec.getField({
                        fieldId: 'custbody_xxflx_sgst_tds_payable'
                    })
                    sgstField.isDisabled = true;
                }
                else{
                    var cgstField = rec.getField({
                        fieldId: 'custbody_xxflx_cgst_tds_payable'
                    })
                    cgstField.isDisabled = false;
                    var sgstField = rec.getField({
                        fieldId: 'custbody_xxflx_sgst_tds_payable'
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
    function getAccountId(tdsTextCode){
        try {
            var accountSearchObj = search.create({
                type: "account",
                filters:
                [
                   ["name","contains",tdsTextCode]
                ],
                columns:
                [
                   search.createColumn({name: "internalid", label: "Internal ID"})
                ]
             });
             var searchResultCount = accountSearchObj.runPaged().count;
             var accID;
             log.debug("accountSearchObj result count",searchResultCount);
             accountSearchObj.run().each(function(result){
                accID = result.id;
                return true;
             });
             return accID;
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
