/**
* @NApiVersion 2.0
* @NScriptType Suitelet
*/

define(['N/ui/serverWidget','N/record','N/redirect','N/search','N/email'],
    function (serverWidget, record, redirect, search, email) {
        function onRequestFxn(context) {
            try{
                if (context.request.method === "GET") {
                    try{
                        var form = serverWidget.createForm({
                            title : 'Please Enter Reject Reason'
                            //hideNavBar : true
                        });
                        form.addField({
                            id : 'custpage_reject_reason',
                            type : serverWidget.FieldType.TEXT,
                            label : 'Reject Reason',
                        }).isMandatory =true;
                        form.addField({
                            id : 'custpage_record_id',
                            type : serverWidget.FieldType.TEXT,
                            label : 'Record Id'
                        }).updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });
                        form.updateDefaultValues({
                            custpage_record_id: context.request.parameters.recordId
                        });
                        form.addField({
                            id : 'custpage_record_type',
                            type : serverWidget.FieldType.TEXT,
                            label : 'Record Type'
                        }).updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });
                        form.updateDefaultValues({
                            custpage_record_type: context.request.parameters.recordType
                        });
                        form.addSubmitButton('Submit');
                        context.response.writePage(form);

                    }
                    catch(e){
                        log.error('Error in get method',e);
                    }
                }
                else {
                    try{
                        var recordId = context.request.parameters.custpage_record_id;
                        var rejectReason = context.request.parameters.custpage_reject_reason;
                        var recordType = context.request.parameters.custpage_record_type;
                        log.debug('recordId',recordId);
                        log.debug('rejectReason',rejectReason);
                        log.debug('recordType',recordType);
                        /*var creatorObj = searchCreatorId(recordId,recordType);
                        log.debug('employeeId',creatorObj.creatorId);
                        var lookupEmployee = search.lookupFields({
                            type: search.Type.EMPLOYEE,
                            id: creatorObj.creatorId,
                            columns : 'custentity_designation'
                            //columns: ['department','email']
                            // columns: ['department','custentity_designation']
                        });
                        log.debug('lookupEmployee',lookupEmployee);
                        var empDesignation = lookupEmployee.custentity_designation[0].value;*/
                        //recordObj.setValue('custbody_approver_designation',empDesignation);
                        var fieldId = '';
                        if(recordType == 'customrecord_xxflx_notesheet'){
                        //fieldId = 'custrecord_ns_reject_reason';
                        record.submitFields({
                            type: recordType,
                            id: recordId,
                            values: {
                            'custrecord_ns_reject_reason' : rejectReason
                                //'custrecord_ns_reject_reason' : rejectReason,
                                
                                // 'custbody_approver_designation' : empDesignation
                                // 'approvalstatus' : 1,
                                // 'nextapprover' : '',
                                // 'custbody_approver_designation' : '',
                                // 'custbody_approver_set_date' : ''
                            }
                            
                        });
                        }
                        else if(recordType == 'customrecord_xxflx_oen_registration'){
                        //fieldId = 'custrecord_reject_reason';
                        record.submitFields({
                            type: recordType,
                            id: recordId,
                            values: {
                            'custrecord_reject_reason' : rejectReason
                                //'custrecord_ns_reject_reason' : rejectReason,
                                
                                // 'custbody_approver_designation' : empDesignation
                                // 'approvalstatus' : 1,
                                // 'nextapprover' : '',
                                // 'custbody_approver_designation' : '',
                                // 'custbody_approver_set_date' : ''
                            }
                            
                        });
                        }
                        //fieldId = fieldId.toString();
                        //log.debug('fieldId',fieldId);
                        /*record.submitFields({
                            type: recordType,
                            id: recordId,
                            values: {
                            fieldId : rejectReason
                                //'custrecord_ns_reject_reason' : rejectReason,
                                
                                // 'custbody_approver_designation' : empDesignation
                                // 'approvalstatus' : 1,
                                // 'nextapprover' : '',
                                // 'custbody_approver_designation' : '',
                                // 'custbody_approver_set_date' : ''
                            }
                            
                        });*/
                        redirect.toRecord({
                            type: recordType,
                             id: recordId
                            // type: 'customrecord_xxflx_notesheet',
                             //id: 3
                        });
                        //https://7515129-sb1.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=2&id=2
                        /*redirect.redirect({
                            url: 'https://7515129-sb1.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=2&id='+recordId
                        });*/
                        /*redirect.redirect({
                            url: 'https://6952096-sb1.app.netsuite.com/app/accounting/transactions/vendbill.nl?id='+recordId,
                            parameters: {
                                'custparam_test': rejectReason
                            }
                        });*/
                        log.debug('redirected back');

                         //sendEmailToApprover(recordId,recordType,rejectReason);
                    }
                    catch(e){
                        log.error('Error in else function',e);
                    }
                }
            }
            catch(e){
                log.error('Error in main function',e);
            }
        }
        function sendEmailToApprover(recordId,recordType,rejectReason){
            try{
                // var recLink = '<a href = "https://6952096-sb1.app.netsuite.com/app/accounting/transactions/purchreq.nl?id="'+recordId+'"&whence="> Click here to navigate requisition </a>;';
                // var fulllink = link+recordId+"&whence=";
                // var recLink = '<a href="'+fulllink+'">View Record</a>';
                var recObj = searchCreatorId(recordId,recordType);
                var bodyContent = "<p style='margin-bottom: .0001pt;font-family: calibri, sans-serif; font-size: 11pt;'>Dear Sir/ Ma'am,</p></br>\
                <p style='margin-bottom: .0001pt;font-family: calibri, sans-serif; font-size: 11pt;'>Below is the reason for the record rejected</p></br>\
                <p style='margin-bottom: .0001pt;font-family: calibri, sans-serif; font-size: 11pt;'>"+rejectReason+"</p>\
                </br>\
                <p style='margin-bottom: .0001pt;font-family: calibri, sans-serif; font-size: 11pt;'>Thank you</p>";
                email.sendBulk({
                    author: 9119,
                    body: bodyContent,
                    recipients: recObj.creatorId,
                    subject: "Record with document number " + recObj.docNo +" is rejected.",
                    // relatedRecords: { transactionId: recordId}
                });
            }
            catch(e){
                log.error('Error while sending email',e);
            }
        }
        function searchCreatorId(recordId,searchType){
            try{
                var purchaserequisitionSearchObj = search.create({
                    type: searchType,
                    filters:
                    [
                    //    ["type","anyof","PurchReq"], 
                    //    "AND", 
                       ["mainline","is","T"], 
                       "AND", 
                       ["internalid","anyof",recordId]
                    ],
                    columns:
                    [
                       search.createColumn({name: "createdby", label: "Created By"}),
                       search.createColumn({name: "tranid", label: "Document Number"})
                    ]
                });
                // var searchResultCount = purchaserequisitionSearchObj.runPaged().count;
                // log.debug("purchaserequisitionSearchObj result count",searchResultCount);
                var docObj = {};
                purchaserequisitionSearchObj.run().each(function(result){
                    // .run().each has a limit of 4,000 results
                    docObj['creatorId'] = result.getValue('createdby');
                    docObj['docNo'] = result.getValue('tranid');
                    return true;
                });
                if(docObj){
                    return docObj;
                }
                else{
                    return false;
                }
            }
            catch(e){
                log.error('Error in searchCreator',e);   
            }
        }
        return {
            onRequest: onRequestFxn
        };
});