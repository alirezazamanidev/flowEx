import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class OrderService{

    constructor(dataSource:DataSource){}
}