import supertest from "supertest";
import {faker} from "@faker-js/faker";

import app from "../../src/app";
import prisma from "../../src/config/database";

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE vouchers`;
})

afterAll(async () => {
    await prisma.$disconnect();
})

describe("POST /vouchers", () => {
    it("Espera um status 201, caso o voucher seja criado", async () => {
        const voucher = {
            code: faker.internet.password(),
            discount: faker.datatype.number({min: 1, max: 100})
        };

        const response = await supertest(app)
            .post("/vouchers")
            .send(voucher)
        
        expect(response.status).toBe(201)
    })
    it("Espera um status 409, caso o voucher esteja em conflito", async () => {
        const voucher = await prisma.voucher.create({
            data: {
                code: faker.internet.password(),
                discount: faker.datatype.number({min: 1, max: 100})
            }
        })

        const newVoucher = {
            code: voucher.code,
            discount: voucher.discount
        }

        const response = await supertest(app)
            .post("/vouchers")
            .send(newVoucher)
        
        expect(response.status).toBe(409)
    })
})

describe("POST /vouchers/apply", () => {
    it("esperava 200, caso o voucher possa ser usado", async () => {
        const voucher = await prisma.voucher.create({
            data: {
                code: faker.internet.password(),
                discount: faker.datatype.number({min: 1, max: 100})
            }
        })

        const voucherApply = {
            code: voucher.code,
            amount: faker.datatype.number({min: 100})
        }

        const response = await supertest(app)
            .post("/vouchers/apply")
            .send(voucherApply)
        
        expect(response.status).toBe(200)
    })
    it("esperava 409, caso o voucher não exista", async () => {
        const voucherApply = {
            code: faker.internet.password(),
            amount: faker.datatype.number({min: 100})
        }

        const response = await supertest(app)
            .post("/vouchers/apply")
            .send(voucherApply)
        
        expect(response.status).toBe(409)
    })
    // it("esperava 200, caso o voucher já tenha sido usado", async () => {
    //     const voucher = await prisma.voucher.create({
    //         data: {
    //             code: faker.internet.password(),
    //             discount: faker.datatype.number({min: 1, max: 100})
    //         }
    //     })
    //     await prisma.voucher.update({
    //         where: {code: voucher.code},
    //         data: { used: true }
    //     })

    //     const voucherApply = {
    //         code: voucher.code,
    //         amount: faker.datatype.number({min: 100})
    //     }

    //     const response = await supertest(app)
    //         .post("/vouchers/apply")
    //         .send(voucherApply)      
        
    //     expect(response.status).toBe(200)
    // })
})