/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
define(["N/record", "N/log", "N/https", "N/search", "N/format", "N/http", "N/runtime", "N/ui/serverWidget", "N/error"], function (record, log, https, search, format, http, runtime, serverWidget, error) {


    function beforeLoad(context) {

        triggeronclosebutton(context);

    }


    function triggeronclosebutton(context) {
        try {
            if (context.type == context.UserEventType.VIEW) {
                var form = context.form;
                var Rec_id = context.newRecord.id; 
                log.debug({
                    title: 'Rec_id',
                    details: Rec_id
                })
                var salesOrderId = context.newRecord.getValue({
                    fieldId: 'custrecord_xxflx_purchase_enquiry_oen'
                })
                log.debug({
                    title: 'salesOrderId',
                    details: salesOrderId
                })
                var environment = runtime.envType;
                log.debug('environment', environment);
                if (environment === 'PRODUCTION') {
                    var url1 = "https://7515129.app.netsuite.com/app/accounting/transactions/salesord.nl?id="+salesOrderId+"&whence="
                }
                else if (environment === 'SANDBOX') {
                    var url1 = "https://7515129-sb1.app.netsuite.com/app/accounting/transactions/salesord.nl?id="+salesOrderId+"&whence="
                }
                log.debug({
                    title: 'url1',
                    details: url1
                })
                form.addButton({
                    id: 'custpageoen',
                    label: 'Open OEN',
                    functionName: 'window.open ("' + url1 + '");'
                });
            }
        }
        catch (e) {
            log.debug(e.name, e.message);
        }
    }

    return {
        beforeLoad: beforeLoad

    };
});