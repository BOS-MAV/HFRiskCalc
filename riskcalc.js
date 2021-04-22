    var          HFpEFCoeff = [],
                 HFrEFCoeff = [];
    function numberFormat(val, decimalPlaces) {

    var multiplier = Math.pow(10, decimalPlaces);
    return (Math.round(val * multiplier) / multiplier).toFixed(decimalPlaces);
}
function calc_risk() 
{
                //declare a totscore variable
                
                var totScore;
                //declare variables to hold the rest
                var age,age_2, age_2ln, sex,race,diabetes, diabetesWeight,   hypertension, hypertension_t; 
                //added BMI_1ln
                var SBP,SBP_1, SBP_2,BMI,BMI_2,BMI_1,BMI_1ln,Scr,eGFR,eGFR2,COPD,Afib,pCad,pMI,height,weight; 
                var mcage2 = [],
                 mcage2ln = [],
                 mcbmi1 = [],
                 mcbmi2 = [],
                 mcsbp1 = [],
                 mcsbp2= [],
                 mcegfr1 = [],
                 mcegfr2 = [],
                 xBeta = [],
                 eXbeta = [],
                 smokerWeight = [],
                 risk = [];

                //initialize arrays to hold the mean centering coefficients for HFpEF and HFrEF
                HFpEFCoeff =    [[0.0002719,0.0003432,0.0003601,0.0004374],
                                [0.001109,0.001359,0.001416,0.001685],
                                [0.004203,0.004293,0.004327,0.004306],
                                [0.001272,0.001308,0.001324,0.001216],
                                [0.007443,0.00737,0.007766,0.007732],
                                [0.0000564,0.0000554,0.0000615,0.0000609],
                                [75.99,86.09,79.89,93.16],
                                [6069,7838,6708,9089]];
                //now get HFrEF
                HFrEFCoeff =    [[0.0002719,0.0003432,0.0003601,0.0004374],
                                [0.001109,0.001359,0.001416,0.001685],
                                [0.1171,0.1179,0.1178,0.1148],
                                [0.03513,0.0355,0.03556,0.03422],                
                                [0.007443,0.00737,0.007766,0.007732],
                                [0.0000564,0.0000554,0.0000615,0.0000609],
                                [75.99,86.09,79.89,93.16],
                                [6069,7838,6708,9089]];
                age = parseInt($("#txtAge").val());
                age_2 = Math.pow(age,-2);
                age_2ln = age_2*Math.log(age);
                if ($("input[name = 'Sex']:checked").val() === "Male")
                    sex = 0;
                else
                    sex = 1;
                race_t = $("input[name = 'Race']:checked").val();
                if (race_t === 'White')
                    race = 0;
                else if (race_t === 'AfrAm')
                    race = 1;
                else
                    race = 0;
                //let's mean-center age for each model
                mcage2[0] = mean_center(HFpEFCoeff[0],age_2,sex,race);
                mcage2[1] = mean_center(HFrEFCoeff[0],age_2,sex,race);
                //mean center the age-2*ln(age)
                mcage2ln[0] = mean_center(HFpEFCoeff[1],age_2ln,sex,race);
                mcage2ln[1] = mean_center(HFrEFCoeff[1],age_2ln,sex,race);
                if ($("input[name = 'Diabetes']:checked").val() === "Yes")
                    diabetes = 1;
                else
                    diabetes = 0;      
                if ($("input[name = 'Smoker']:checked").val() === "Current")
                {
                    smokerWeight[0] = get_smokeWeight(2,sex,race,0);
                    smokerWeight[1] = get_smokeWeight(2,sex,race,1);
                }
                else if ($("input[name = 'Smoker']:checked").val() === "Former")
                {
                    smokerWeight[0] = get_smokeWeight(1,sex,race,0);
                    smokerWeight[1] = get_smokeWeight(1,sex,race,1); 
                }
                else
                {
                    smokerWeight[0] = 0;
                    smokerWeight[1] = 0;
                }
                SBP = parseInt($("#BP_Sys").val());
                SBP_1 = 1/SBP;
                SBP_2 = Math.pow(SBP,-2);
                if ($("input[name = 'Hypertension']:checked").val() === "Yes")
                    hypertension = 1;
                else
                    hypertension = 0;
                //check here if the radio button has been checked
                if ($("#entBMI").text()==="Enter BMI") 
                {
                    height = parseFloat($("#txtHeight").val());
                    weight = parseFloat($("#txtWeight").val());
                    BMI = calc_bmi(height,weight);
                }
                else
                {
                       BMI = parseFloat($("#txtBMI").val());
                }
                BMI_1 = Math.pow(BMI,-1);
                BMI_2 = Math.pow(BMI,-2);
                // Define BMI^{-1} * ln(BMI), used in HFrEF risk equation only
                BMI_1ln = BMI_1*Math.log(BMI);
                BMI_2ln = BMI_2*Math.log(BMI);
                if ($("input[name = 'PrevMI']:checked").val() === "Yes")
                    pMI = 1;
                else
                    pMI = 0;
                if ($("input[name = 'PrevCAD']:checked").val() === "Yes")
                    pCAD = 1; 
                else
                    pCAD = 0;
                if ($("input[name = 'PrevAFIB']:checked").val() === "Yes")
                    aFib = 1;
                else
                    aFib = 0;
                if ($("input[name = 'COPD']:checked").val() === "Yes")
                    COPD = 1;
                else
                    COPD = 0;   
                //let's calculate eGFR
                //first, get the serum creatinine
                scr=parseFloat($("#Ser_Creat").val());
                if ((sex === 1) && (scr <= 0.7)) //female and serum creatinine <= 0.7
                {
                    eGFR = 144 *Math.pow((scr/0.7),-0.329) * Math.pow(0.993,age);
                    if (race === 1) //African American
                        eGFR = eGFR*1.159;
                }
                else if ((sex === 1) && (scr > 0.7)) //female and serum creatinine > 0.7
                {
                    eGFR = 144 *Math.pow((scr/0.7),-1.209) * Math.pow(0.993,age);
                    if (race === 1) //African American
                        eGFR = eGFR*1.159;
                }
                else if ((sex === 0) && (scr <= 0.9)) //male and serum creatinine <= 0.9
                {
                    eGFR = 144 *Math.pow((scr/0.9),-0.411) * Math.pow(0.993,age);
                    if (race === 1) //African American
                        eGFR = eGFR*1.159;
                }
                else if ((sex === 0) && (scr > 0.9)) //male and serum creatinine > 0.9
                {
                    eGFR = 144 *Math.pow((scr/0.9),-1.209)* Math.pow(0.993,age);
                    if (race === 1) //African American
                        eGFR = eGFR*1.159;
                }
                eGFR2 = Math.pow(eGFR,2);
                //now let's mean-center the remaining continuous variables
                //all arrays have the first element for HFpEF and second for HFrEF
                //first bmi-1
           
                mcbmi1[0] = mean_center(HFpEFCoeff[2],BMI_2,sex,race);
                mcbmi1[1] = mean_center(HFrEFCoeff[2],BMI_1,sex,race);
                //next bmi-2
                mcbmi2[0] = mean_center(HFpEFCoeff[3],BMI_2ln,sex,race);
                mcbmi2[1] = mean_center(HFrEFCoeff[3],BMI_1ln,sex,race); //replaced BMI_2 with BMI_1ln
                //now SBP-1
                mcsbp1[0] = mean_center(HFpEFCoeff[4],SBP_1,sex,race);
                mcsbp1[1] = mean_center(HFrEFCoeff[4],SBP_1,sex,race);
                //next SBP-2
                mcsbp2[0] = mean_center(HFpEFCoeff[5],SBP_2,sex,race);
                mcsbp2[1] = mean_center(HFrEFCoeff[5],SBP_2,sex,race);
                //eGFR
                mcegfr1[0] = mean_center(HFpEFCoeff[6],eGFR,sex,race);
                mcegfr1[1] = mean_center(HFrEFCoeff[6],eGFR,sex,race);
                //egfr2
                mcegfr2[0] = mean_center(HFpEFCoeff[7],eGFR2,sex,race);
                mcegfr2[1] = mean_center(HFrEFCoeff[7],eGFR2,sex,race);
                if ((sex === 0) && (race ===0)) //white male
                {
                    //first HFpEF
                    xBeta[0] = mcage2[0]*-12109 + mcage2ln[0] * 2661.4 + diabetes*0.51164 + mcbmi1[0]*9425.8+mcbmi2[0]*-3602.1+mcsbp1[0]*-985.64+mcsbp2[0]*57223;
                    xBeta[0] += hypertension * 0.4293 + pMI * 0.78142 + aFib * 0.58838 + smokerWeight[0] + COPD * 0.74054 + mcegfr1[0] * -0.053519;
                    xBeta[0] += mcegfr2[0] * 0.0003394;
                    //now HFrEF
                    xBeta[1] = mcage2[1]*-25555 + mcage2ln[1] * 6884.9 + diabetes*0.52724 + mcbmi1[1]*291.46+mcbmi2[1]*-143.43+mcsbp1[1]*-903.06+mcsbp2[1]*55221;
                    xBeta[1] += hypertension * 0.27418 + pMI * 0.86422 + pCAD * 0.58366 + aFib * 0.4946 + smokerWeight[1] + COPD * 0.37526 + mcegfr1[1] * -0.053074;
                    xBeta[1] += mcegfr2[1] * 0.0003372;
                }
                else if ((sex === 0) && (race ===1)) //African American male
                {
                    //first HFpEF
                    xBeta[0] = mcage2[0]*14095 + mcage2ln[0] * -4872.6 + diabetes*0.57952 + mcbmi1[0]*7548.3+mcbmi2[0]*-2880.9+mcsbp1[0]*-1087.4+mcsbp2[0]*62181;
                    xBeta[0] += hypertension * 0.49896 + pMI * 0.93678 + aFib * 0.67559 + smokerWeight[0] + COPD * 0.5999 + mcegfr1[0] * -0.049801;
                    xBeta[0] += mcegfr2[0] * 0.0002633;
                    //now HFrEF
                    xBeta[1] = mcage2[1]*-83492 + mcage2ln[1] * -385.19 + diabetes*0.47692 + mcbmi1[1]*233.43+mcbmi2[1]*-101.8+mcsbp1[1]*-837.18+mcsbp2[1]*46639;
                    xBeta[1] += hypertension * 0.30714 + pMI * 0.93181 + pCAD * 0.48043+ aFib * 0.641 + smokerWeight[1] + COPD * 0.23856 + mcegfr1[1] * -0.037254;
                    xBeta[1] += mcegfr2[1] * 0.000199;
                }
                else if ((sex === 1) && (race === 0)) //White Female
                {
                    //first HFpEF
                    xBeta[0] = mcage2[0]*5994.6 + mcage2ln[0] * -2947.9 + diabetes*0.63336 + mcbmi1[0]*6559.6+mcbmi2[0]*-2527.3+mcsbp1[0]*-998.98+mcsbp2[0]*58704;
                    xBeta[0] += hypertension * 0.6391 + pMI * 0.88003 + aFib * 0.51617 + smokerWeight[0] + COPD * 0.58356 + mcegfr1[0] * -0.057943;
                    xBeta[0] += mcegfr2[0] * 0.000365;
                    //now HFrEF 
                    xBeta[1] = mcage2[1]*-9178.6 + mcage2ln[1] * 1609.2 + diabetes*0.6817 + mcbmi1[1]*158.83+mcbmi2[1]*-68.78+mcsbp1[1]*-346.89+mcsbp2[1]*15427;
                    xBeta[1] += hypertension * 0.36158 + pMI * 1.1897 + pCAD * 0.38117 + aFib * 0.69002 + smokerWeight[1] + COPD * 0.44946 + mcegfr1[1] *-0.04332;
                    xBeta[1] += mcegfr2[1] * 0.000291;
                }
                else if ((sex === 1) && (race === 1)) //African American Female
                {
                    //first HFpEF
                    xBeta[0] = mcage2[0]*53998 + mcage2ln[0] * -16568 + diabetes*1.1098 + mcbmi1[0]*5563.3+mcbmi2[0]*-2123.2+mcsbp1[0]*-1304.3+mcsbp2[0]*77747;
                    xBeta[0] += hypertension * 0.57677 + pMI * 0.39867 + aFib * 0.6762 + smokerWeight[0] + COPD * 0.70649 + mcegfr1[0] * -0.029997;
                    xBeta[0] += mcegfr2[0] * 0.000148;
                    //now HFrEF
                    xBeta[1] = mcage2[1]*-25689 + mcage2ln[1] * 7198.6 + diabetes*0.47949 + mcbmi1[1]*81.192+mcbmi2[1]*-33.486+mcsbp1[1]*-1317.8+mcsbp2[1]*74320;
                    xBeta[1] += hypertension * 0.46672 + pMI * 0.95611 + pCAD *0.71224 + aFib * 1.8717 + smokerWeight[1] + COPD * 0.30188 + mcegfr1[1] * -0.06293;
                    xBeta[1] += mcegfr2[1] * 0.000338;
                }
                eXbeta[0] = Math.exp(xBeta[0]);
                eXbeta[1] = Math.exp(xBeta[1]);
                if ((sex === 0) && (race ===0)) //white male
                {
                    risk[0] = 1- Math.pow(0.9876620,eXbeta[0]);
                    risk[1] = 1 - Math.pow(0.9810523,eXbeta[1]);
                }
                else  if ((sex === 0) && (race ===1)) //African American male
                {
                    risk[0] = 1- Math.pow(0.9875125,eXbeta[0]);
                    risk[1] = 1 - Math.pow(0.9772251,eXbeta[1]);
                }
                else if ((sex === 1) && (race ===0)) //white females
                {
                    risk[0] = 1- Math.pow(0.9922709,eXbeta[0]);
                    risk[1] = 1 - Math.pow(0.9936850,eXbeta[1]);
                }
                else if ((sex === 1) && (race ===1)) //African American females
                {
                    risk[0] = 1- Math.pow(0.9929547,eXbeta[0]);
                    risk[1] = 1 - Math.pow(0.9942633,eXbeta[1]);
                }
                risk[0] = numberFormat(risk[0]*100,2);
                risk[1] = numberFormat(risk[1]*100,2)
                return risk;
 }   

function mean_center(coeff,cent_var,sex,race)
/* Function Name:   mean_center
 * Purpose:         This function uses a coefficient to center the mean
 * Input:           coeff: an array of coefficients used for centering
 *                  cent_var: the actual variable that will be centered
 *                  sex: the gender
 *                  race: the race
 * Returns:         the centered mean
 */
{
    var ret_val;
    if (sex === 0) //male
    {
        if (race === 0) //white
        {
            ret_val = cent_var-coeff[0];
        }
        else //African American
        {
            ret_val = cent_var-coeff[1];
        }
    }
    else // female
    {
        if (race === 0) //white
        {
            ret_val = cent_var-coeff[2];
        }
        else //African American
        {
            ret_val = cent_var-coeff[3];
        }
    } 
    return ret_val;
}

function get_smokeWeight(type,sex,race,model)
/*
 * Name:        get_smokeWeight
 * Description: calculates the value for smoking based on the sex, race and model
 * Input:       type:   2 - current
 *                      1 - former
 *              sex:    gender
 *              race:   race 0 -white 1 - African American
 *              model:  0 - HFpEF
 *                      1 - HFrEF
 * Output:      smoking weight
 */
{
    var ret_val;
    if ((sex ===0 ) && (race === 0)) //white male
    {
        if (model === 0) //HFpEF
        {
            if (type === 2) //current
                ret_val = 0.46217;
            else
                ret_val = 0.2377;
        }
        else //HFrEF
        {
            if (type === 2) //current
                ret_val = 0.54047;
            else
                ret_val = 0.24067;
        }
    }
    else if ((sex ===0 ) && (race === 1)) //African American male
    {
         if (model === 0) //HFpEF
        {
            if (type === 2) //current
                ret_val = 0.31372;
            else
                ret_val = 0.24107;
        }
        else //HFrEF
        {
            if (type === 2) //current
                ret_val = 0.53331;
            else
                ret_val = 0.30329;
        }
    }
    else if ((sex === 1 ) && (race === 0)) //White Female
    {
        if (model === 0) //HFpEF
        {
            if (type === 2) //current
                ret_val = 0.72708;
            else
                ret_val = 0.2081;
        }
        else //HFrEF
        {
            if (type === 2) //current
                ret_val = 0.81355;
            else
                ret_val = 0.2261;
        }
    }
    else if ((sex === 1 ) && (race === 1)) //African American Women
    {
        if (model === 0) //HFpEF
        {
            if (type === 2) //current
                ret_val = 0.46656;
            else
                ret_val = 0.13677;
        }
        else //HFrEF
        {
            if (type === 2) //current
                ret_val = 0.82059;
            else
                ret_val = 0.53959;
        }
    }
    return ret_val;
}
function calc_bmi(ht,wt)
{
    var ret_val = (wt/ht/ht)*703;
    return ret_val;
}

