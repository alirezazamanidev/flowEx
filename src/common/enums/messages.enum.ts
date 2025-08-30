

export enum AuthMessages {
    OtpNotExpired='کد تایید هنوز منقضی نشده است!',
    OtpCodeExpired='کد تایید منقضی شده است!',
    OtpCodeInvalid='کد تایید صحییح نمیباشد!',
    SentOtpCode='ک تایید با موفقیت ارسال شد!',
    InvalidCredentials='یوزنیم یا پسورد نادرست است!',
    LoginAgain='لطفا دوباره وارد شوید!',
    Login='ورود با موفقیت انجام شد!'
}
export enum NotFoundMessage{
    user='اکانت شما یافت نشد!',
    Wallet='کیف پول شما یافت نشد!'
}
export enum BadRequestMessage {
  INSUFFICIENT_WALLET_BALANCE = "موجودی کیف پول کافی نیست"
}
export enum PublicMessages{
    PostCreated='پست با موفقیت ایجاد شد!'

}