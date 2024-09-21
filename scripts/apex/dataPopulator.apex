Integer NUM_C = 4;
Integer NUM_A_PER_C = 1;
Integer NUM_B_PER_A = 5;
Integer NUM_JUNC_A_TO_D = 3;  // D per A
Integer NUM_JUNC_D_TO_A = 2;  // A per D
Decimal LAT_LOW = 16.0,
        LAT_HIGH = 20.0,
        LONG_LOW = 77.5,
        LONG_HIGH = 81.5;
Integer NUM_A_D_GROUPS = null;  // to be calculated ...


List<String> randomMultipick(List<String> l) {
    List<String> ans = new List<String>();
    for(String str: l) if(Math.random() >= 0.5) ans.add(str);
    return ans;
}


List<Learn_A__c> listA = new List<Learn_A__c>();
List<Learn_B__c> listB = new List<Learn_B__c>();
List<Learn_C__c> listC = new List<Learn_C__c>();
List<Learn_D__c> listD = new List<Learn_D__c>();
List<Learn_A_D_Junction_Object__c> listAD = new List<Learn_A_D_Junction_Object__c>();


// C construction ...
for(Integer i = 1; i <= NUM_C; i++) listC.add(new Learn_C__c(Name = 'C' + i));
insert listC;


// A construction ...
Datetime curTime = Datetime.newInstance(2000, 1, 1, 13, 0, 0);
Boolean alternatingIsChecked = true;
Integer iteratorA = 1;
List<String> picklistValues = new List<String>(); for(Schema.PicklistEntry pe: Schema.getGlobalDescribe().get('Learn_A__c').getDescribe().fields.getMap().get('Picklist__c').getDescribe().getPicklistValues()) picklistValues.add(pe.getLabel());
List<String> multiPicklistValues = new List<String>(); for(Schema.PicklistEntry pe: Schema.getGlobalDescribe().get('Learn_A__c').getDescribe().fields.getMap().get('Multi_Picklist__c').getDescribe().getPicklistValues()) multiPicklistValues.add(pe.getLabel());

for(Learn_C__c objC: listC) for(Integer i = 1; i <= NUM_A_PER_C; i++) for(String pick: picklistValues)
{
    listA.add(new Learn_A__c(
        Name = objC.Name + '\'s A' + iteratorA++, 
        Learn_C__c = objC.Id, 
        Is_Checked__c = alternatingIsChecked, 
        Location__Latitude__s = LAT_LOW + (LAT_HIGH - LAT_LOW) * Math.random(), 
        Location__Longitude__s = LONG_LOW + (LONG_HIGH - LONG_LOW) * Math.random(), 
        Time__c = curTime, 
        Picklist__c = pick,
        Multi_Picklist__c = String.join(randomMultipick(multiPicklistValues), ';'),
        Phone_Number__c = '+91 ' + (1000000000L + (Long) (Math.random() * 8999999999L))
    ));

    alternatingIsChecked = !alternatingIsChecked;
    curTime = curTime.addMonths(1);
}
insert listA;


// B construction ...
for(Learn_A__c objA: listA) for(Integer i = 1; i <= NUM_B_PER_A; i++) listB.add(new Learn_B__c(Name = objA.Name + '\'s B' + i, Learn_A__c = objA.Id));
insert listB;

// D construction ...
Assert.areEqual(Math.mod(listA.size(), NUM_JUNC_D_TO_A), 0);  // Needed to satisfy constraints ...
NUM_A_D_GROUPS = listA.size() / NUM_JUNC_D_TO_A;
for(Integer groupNumber = 0; groupNumber < NUM_A_D_GROUPS; groupNumber++) {
    List<String> parentObjectList = new List<String>();
    for(Integer i = groupNumber * NUM_JUNC_D_TO_A; i < (groupNumber + 1) * NUM_JUNC_D_TO_A; i++) parentObjectList.add(listA[i].Name);
    String parentObjects = String.join(parentObjectList, ' , ');
    for(Integer j = 1; j <= NUM_JUNC_A_TO_D; j++) listD.add(new Learn_D__c(Name = '[' + parentObjects + ']\'s D' + j));
}
insert listD;


// A D Junction Object construction ...
for(Integer groupNumber = 0; groupNumber < NUM_A_D_GROUPS; groupNumber++)
    for(Integer i = groupNumber * NUM_JUNC_D_TO_A; i < (groupNumber + 1) * NUM_JUNC_D_TO_A; i++)
        for(Integer j = groupNumber * NUM_JUNC_A_TO_D; j < (groupNumber + 1) * NUM_JUNC_A_TO_D; j++)
            listAD.add(new Learn_A_D_Junction_Object__c(Name = '[' + listA[i].Name + ' & ' + listD[j].Name + ']\'s AD Junction Object', Learn_A__c = listA[i].Id, Learn_D__c = listD[j].Id));
insert listAD;