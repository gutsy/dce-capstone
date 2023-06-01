import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import payloadJson from 'src/assets/to-send.json';
import {FlowServiceService} from "../flow-service.service";

@Component({
    selector: 'app-example-form',
    templateUrl: './example-form.component.html',
    styleUrls: ['./example-form.component.css']
})
export class ExampleFormComponent implements OnInit {

    public exampleForm: FormGroup;
    private demoPayload = payloadJson;

    //pulled from the "when http request is received" step of the Power Automate flow
    private flowUrl = 'https://prod-160.westus.logic.azure.com:443/workflows/2d2e99c2c2564ddbbabaadf0ed82434c/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=aPqSvpR-pmbzVM3xVR27mImSWDTFHgDJiiz1622cYhs';

    constructor(private formBuilder: FormBuilder,
                private flowService: FlowServiceService) {
        this.exampleForm = this.formBuilder.group({
            sendTo: ['', [Validators.required, Validators.email]],
            name: [''],
            cc: ['', Validators.email]
        });
    }

    onSubmit(): void {
        this.populatePayload();
        let call = this.flowService.makeAgreement(this.flowUrl, this.demoPayload);
        console.log('starting call...');
        call.subscribe(data => {
            console.log(data);
            if (data.status === 202) {
                //delay is handled in the Power Automate flow
                alert("Your Form Has Been Sent.");
                this.exampleForm.reset();
            } else if (data.status === 200){
                if (data.body) {
                    // @ts-ignore
                    window.location.href = data.body[0].esignUrl; //the redirect from your site
                }
            }
        }, error => {
            console.log(error);
            alert('There has been an error. How embarrassing.');
        });

    }

    populatePayload(): void {
        this.demoPayload.payload.sendAgreementTo = this.exampleForm.controls['sendTo'].value;
        if (this.exampleForm.controls['name'].value) {
            console.log('setting the name to' + this.exampleForm.controls['name'].value)
            this.demoPayload.payload.name = this.exampleForm.controls['name'].value;
        }
        if (this.exampleForm.controls['cc'].value) {
            console.log('setting the cc to' + this.exampleForm.controls['cc'].value)
            this.demoPayload.payload.cc = this.exampleForm.controls['cc'].value;
        }
    }

    ngOnInit(): void {
    }
}
