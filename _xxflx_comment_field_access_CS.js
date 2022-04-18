/**
 *@NApiVersion 2.0
*@NScriptType ClientScript
*/
define(['N/runtime', 'N/search'],
function(runtime, search) {
    function pageInit(context) {
        try{
            var userObj = runtime.getCurrentUser();
            log.debug('userObj',userObj);
            var employeeId = userObj.id;
            var employeeDesignation = search.lookupFields({
                type: search.Type.EMPLOYEE,
                id: employeeId,
                columns: 'custentity_employee_designation'
            }).custentity_employee_designation;
            employeeDesignation = employeeDesignation[0].value;
        
            var recordObj = context.currentRecord;

            var projectManagerCom = recordObj.getField("custrecord_project_manager_comment");
            var financeManagerCom = recordObj.getField("custrecord_finance_manager_comment");
            var ceoCom = recordObj.getField("custrecord_ceo_comment");

            if(employeeDesignation == 1){
                projectManagerCom.isDisabled = false;
                financeManagerCom.isDisabled = true;
                ceoCom.isDisabled = true;
            }
            else if(employeeDesignation == 2){
                projectManagerCom.isDisabled = true;
                financeManagerCom.isDisabled = false;
                ceoCom.isDisabled = true;
            }
            else if(employeeDesignation == 3){
                projectManagerCom.isDisabled = false;
                financeManagerCom.isDisabled = false;
                ceoCom.isDisabled = false;
            }
            
            
        }
        catch(e){
            log.error('Error in pageInit',e);
        }
    }
    return {
        pageInit: pageInit
    };
});