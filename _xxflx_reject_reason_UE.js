/**
 *@NApiVersion 2.0
*@NScriptType UserEventScript
*/
define(['N/record','N/runtime','N/redirect'],
function(record, runtime, redirect) {
    function beforeLoad(context) {
        try{
            log.debug('context.type',context.type);
            //if (context.type !== context.UserEventType.VIEW){
                var recObj  = context.newRecord;
                log.debug('recObj.type',recObj.type);
                var userObj = runtime.getCurrentUser();
                var roleCenter = userObj.roleCenter;
                log.debug('roleCenter',roleCenter);
                log.debug('userObj',userObj);
                // if(roleCenter != 'EMPLOYEE'){
                    //if(){
                    var isRejected;
                    if(recObj.type == 'customrecord_xxflx_oen_registration'){
                        isRejected = recObj.getValue('custrecord_is_rjected');
                        }
                        else if(recObj.type == 'customrecord_xxflx_notesheet'){
                        isRejected = recObj.getValue('custrecord_is_reject');
                        }
                        
                        log.debug('isRejected',isRejected);
                        if(isRejected == true){
                            var redirect1= redirect.toSuitelet({
                                scriptId:  'customscript_xxflx_reject_reason_sl' ,
                                deploymentId:'customdeploy_xxflx_reject_reason_sl',
                                parameters: {
                                    recordId : recObj.id,
                                    recordType : recObj.type
                                }
                            }); 
                        }

                    //}
                // }
            //}
        }
        catch(e){
            log.error('Error in main function',e);
        }
    }
    return {
        beforeLoad: beforeLoad
    };
});