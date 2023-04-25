package {{importPackage}}.{{lowerCaseAppName}}.application.{{version}};

import {{importPackage}}.{{lowerCaseAppName}}.application.{{version}}.wsproxytemplate.back.ApimService;

import javax.inject.Inject;
{{resourceImports}}
import {{importPackage}}.{{lowerCaseAppName}}.commons.Constants;

public class ApplicationResource {

    @Inject
    ApimService apim;
    {{{resourceTemplate}}}
}
