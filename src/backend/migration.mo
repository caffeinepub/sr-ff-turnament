module {
  public type OldAppSettings = {
    appName : Text;
    minWithdraw : Nat;
    referralBonus : Nat;
    supportContact : Text;
    upiDetails : Text;
    privacyPolicy : Text;
    termsAndConditions : Text;
    refundPolicy : Text;
    announcementText : Text;
  };

  public type NewAppSettings = {
    appName : Text;
    minWithdraw : Nat;
    referralBonus : Nat;
    minDeposit : Nat;
    supportContact : Text;
    upiDetails : Text;
    privacyPolicy : Text;
    termsAndConditions : Text;
    refundPolicy : Text;
    announcementText : Text;
  };

  type OldActor = {
    settings : ?OldAppSettings;
  };

  type NewActor = {
    settings : ?NewAppSettings;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      settings = switch (old.settings) {
        case (null) { null };
        case (?oldSettings) {
          ?{
            oldSettings with
            minDeposit = 0;
          };
        };
      };
    };
  };
};
