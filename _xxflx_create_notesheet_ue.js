/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
 define(["N/record", "N/log", "N/https", "N/search", "N/format", "N/http", "N/runtime", "N/ui/serverWidget", "N/error"], function (record, log, https, search, format, http, runtime, serverWidget, error) {
    function beforeLoad(context) {
        triggeronreceivebutton(context);
    }

    function triggeronreceivebutton(context) {
        try {
            if (context.type == context.UserEventType.VIEW) {
                var form = context.form;
                form.clientScriptModulePath = 'SuiteScripts/_xxflx_create_notesheet_cs.js';
                form.addButton({
                    id: 'custpagenotesheet',
                    label: 'Create NoteSheet',
                    //functionName: 'createNoteSheet'
                });
                form.addButton({
                    id: 'custpagepurchaseenquiry',
                    label: 'Create Purchase Enquiry',
                    functionName: 'createPurchaseEnquiry'
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