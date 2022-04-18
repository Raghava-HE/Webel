/**
 * @NApiVersion 2.0
 * @NScriptType WorkflowActionScript
 */
define(['N/search', 'N/email', 'N/record', 'N/runtime'], function(search, email, record, runtime) {
function onAction(scriptContext){
    try{
        var recordObj = scriptContext.newRecord;

        var nextApprover = recordObj.getValue('custrecord_xxflx_project_manager');
        log.debug('nextApprover',nextApprover);
        // var projectManagerComment = recordObj.getField("memo");
                
        // if (approvalChkBox)
        //     memoField.isDisabled = true;
        // else
        //     memoField.isDisabled = false;
        //     sendEmail(approver);
        if(nextApprover){
            var nextapproverDesignation = search.lookupFields({
                type: search.Type.EMPLOYEE,
                id: nextApprover,
                columns: 'custentity_employee_designation'
            }).custentity_employee_designation;
            log.debug('nextapproverDesignation',nextapproverDesignation);
            nextapproverDesignation = nextapproverDesignation[0].value;
            recordObj.setValue('custrecord_xxflx_next_approver',nextApprover);
            recordObj.setValue('custrecord_approver_designation',nextapproverDesignation);
            recordObj.setValue('custrecord_xxflx_project_manager','');
            sendEmail(nextApprover,recordObj);
        }
        else{
            var approverDesignation = searchApproverDesignation(recordObj);
            log.debug('approverDesignation',approverDesignation);
            var approverObj = searchApprover(approverDesignation);
            log.debug('approverObj',approverObj);
            if(approverDesignation){
                recordObj.setValue('custrecord_xxflx_next_approver',approverObj.employeeId);
                recordObj.setValue('custrecord_approver_designation',approverObj.employeeDesignation);
                sendEmail(approverObj.employeeId,recordObj);
            }
            else{
                recordObj.setValue('custrecord_xxflx_next_approver','');
                recordObj.setValue('custrecord_approver_designation','');
            }
        }

    }
    catch(e){
        log.error('Error in onAction',e);
    }
}
function sendEmail(nextApprover,recordObj){
    try{
        log.debug('Email sent to approver',nextApprover);
        var link = 'https://7515129-sb1.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=2&id=';
        var fulllink = link + recordObj.id;

        var emailSub = "Approve Note Sheet";
        var emailBody = "Please Approve the Note Sheet.";
        var recLink = '<a href="'+fulllink+'">View Record</a>';
        bodyContent = "<p style='margin-bottom: .0001pt;font-family: calibri, sans-serif; font-size: 11pt;'>Dear Sir/ Ma'am,</p></br>\
        <p style='margin-bottom: .0001pt;font-family: calibri, sans-serif; font-size: 11pt;'>"+ emailBody +"</p></br>\
        <p style='margin-bottom: .0001pt;font-family: calibri, sans-serif; font-size: 11pt;'> Record Link: " + recLink + "</p>\
        </br>\
        <p style='margin-bottom: .0001pt;font-family: calibri, sans-serif; font-size: 11pt;'>Thank you</p>";
        email.sendBulk({
            author: 120,
            body: bodyContent,
            recipients: nextApprover,
            subject: emailSub,
            // relatedRecords: { transactionId: recordId}
        });
    }
    catch(e){
        log.error('Error while sending email',e);
    }
}
function searchApproverDesignation(recordObj){
    try{
        var currentAppDesignation = recordObj.getValue('custrecord_approver_designation');
        log.debug('currentAppDesignation',currentAppDesignation);

        var customrecord_notesheet_app_selectionSearchObj = search.create({
            type: "customrecord_notesheet_app_selection",
            filters:
            [
               ["custrecord_curr_app_desination","anyof",currentAppDesignation]
            ],
            columns:
            [
               search.createColumn({name: "custrecord_next_app_designation", label: "Next Approver Designation"})
            ]
        });
        var searchResultCount = customrecord_notesheet_app_selectionSearchObj.runPaged().count;
        // log.debug("customrecord_notesheet_app_selectionSearchObj result count",searchResultCount);
        if(searchResultCount > 0){
            var nextAppDesignation;
            customrecord_notesheet_app_selectionSearchObj.run().each(function(result){
                // .run().each has a limit of 4,000 results
                nextAppDesignation = result.getValue('custrecord_next_app_designation');
                return true;
            });

            return nextAppDesignation;
        }
    }
    catch(e){
        log.error('Error in searchApproverDesignation',e);
    }
}
function searchApprover(approverDesignation){
    try{
        var employeeSearchObj = search.create({
            type: "employee",
            filters:
            [
               ["custentity_employee_designation","anyof",approverDesignation]
            ],
            columns:
            [
               search.createColumn({name: "internalid", label: "Internal ID"}),
               search.createColumn('custentity_employee_designation')
            ]
        });
        var searchResultCount = employeeSearchObj.runPaged().count;
        // log.debug("employeeSearchObj result count",searchResultCount);
        if(searchResultCount > 0){
            var nextApproverObj = {};
            employeeSearchObj.run().each(function(result){
                // .run().each has a limit of 4,000 results
                nextApproverObj["employeeId"] = result.getValue('internalid');
                nextApproverObj["employeeDesignation"] = result.getValue('custentity_employee_designation');
                return true;
            });

            return nextApproverObj;
        }

    }
    catch(e){
        log.error('Error while searching approvers',e);
    }
}
return {
    onAction: onAction
}
});