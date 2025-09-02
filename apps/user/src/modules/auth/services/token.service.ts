import { HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "../types/jwtPayload.type";
import { RpcException } from "@nestjs/microservices";

@Injectable()
export class TokenService {

    constructor(private readonly jwtService:JwtService){}
    async generateJwtToken(payload:JwtPayload){
        try {
            return this.jwtService.sign(payload,{secret:process.env.JWT_SECRET_KEY,expiresIn:'7d'})
        } catch (error) {
            throw new RpcException({message:error.message,statusCode:HttpStatus.UNAUTHORIZED})
        }

    }
    async verifyJwtToken(token: string):Promise<JwtPayload> {
        try {
            return this.jwtService.verify(token, { secret: process.env.JWT_SECRET_KEY });
        } catch (error) {
            throw new RpcException({message:error.message,statusCode:HttpStatus.UNAUTHORIZED})
        
        }
    }
}