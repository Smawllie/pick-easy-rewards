import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AuthenticationService } from "src/app/shared/authentication.service";

@Component({
  selector: "app-landing-page",
  templateUrl: "./landing-page.component.html",
  styleUrls: ["./landing-page.component.css"],
})
export class LandingPageComponent {
  currentUser = this.authenticationService.currentUser;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    if (this.currentUser) {
      this.router.navigateByUrl(
        this.currentUser.isRestaurantStaff ? "/restaurant" : "/customer"
      );
    }
  }
}
