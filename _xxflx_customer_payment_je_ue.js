/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(["N/record", "N/log", "N/https", "N/search", "N/format", "N/http", "N/runtime", "N/ui/serverWidget", "N/error", "N/task"], function (record, log, https, search, format, http, runtime, serverWidget, error,task) {

    function afterSubmit(context) {
        try {
            log.debug({
                title: "LINE 10"
            })
            if (context.type == context.UserEventType.CREATE) {
                log.debug({
                    title: "LINE 14"
                })
                var recId = context.newRecord.id;
                log.debug({
                    title: 'recId is',
                    details: recId
                });
                var scheduleScriptTaskObj = task.create({
                    taskType: task.TaskType.SCHEDULED_SCRIPT,
                    deploymentId: 'customdeploy_xxflx_payment_je_creation',
                    params: {
                        custscript_xxflx_payment_record_id:recId
                    },
                    scriptId: 'customscript_xxflx_payment_je_creation',
                })
                scheduleScriptTaskObj.submit();
            }
        } catch (error) {
            log.error({
                title: error.name,
                details: error.message
            })
        }
    }
    return {
        afterSubmit: afterSubmit
    }
});
