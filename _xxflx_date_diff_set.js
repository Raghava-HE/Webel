/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
 define(['N/record','N/search','N/format'], function(record,search,format) {
    function saveRecord(context) {
        try {
            var rec = context.currentRecord
            var regDate = rec.getValue({
                fieldId: 'custrecord_xxflx_oen_reg_date'
            })
            var regTime = regDate.getTime()
            var systemTime = new Date().getTime()
            var diffTime = (parseFloat(systemTime)-parseFloat(regTime)).toFixed(0);
            var days = (diffTime/(60*60*24*1000)).toFixed(0);
            var justificationDelay = rec.getValue({
                fieldId: 'custrecord_xxflx_oen_reg_justif_delay'
            })
            if(days>=7){
                if(justificationDelay==''){
                    alert("Kindly enter the justification delay reason")
                    return false;
                }
            }
            return true
        }catch (error) {
            log.error({
                title: error.name,
                details: error.message
            })
        }
    }
    function fieldChanged(context) {
        try {
            if(context.fieldId =='custrecord_xxflx_oen_reg_date'){
                var rec = context.currentRecord
                var regDate = rec.getValue({
                    fieldId: 'custrecord_xxflx_oen_reg_date'
                })
                var regTime = regDate.getTime()
                var systemTime = new Date().getTime()
                var diffTime = (parseFloat(systemTime)-parseFloat(regTime)).toFixed(0);
                var days = (diffTime/(60*60*24*1000)).toFixed(0);
                if(days>=7){
                    var justificationDelay = rec.getField({
                        fieldId: 'custrecord_xxflx_oen_reg_justif_delay'
                    })
                    justificationDelay.isMandatory = true;
                    rec.setValue({
                        fieldId: 'custrecord_xxflx_oen_reg_approval',
                        value: 1
                    })
                }
                else{
                    var justificationDelay = rec.getField({
                        fieldId: 'custrecord_xxflx_oen_reg_justif_delay'
                    })
                    justificationDelay.isMandatory = false;
                    rec.setValue({
                        fieldId: 'custrecord_xxflx_oen_reg_approval',
                        value: 2
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
      saveRecord: saveRecord,
        fieldChanged: fieldChanged
    }
});
