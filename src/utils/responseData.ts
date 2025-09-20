import express from "express";

export default class ResponseData {
    private data: Object;
    private status: number;
    private headers?: Object;
    
    public constructor(data: Object, status: number, headers?: Object) {
        this.data = data;
        this.status = status;
        this.headers = headers;
    }

    public send(res: express.Response) {
        if (this.headers !== undefined) {
            Object.entries(this.headers).forEach(([key, value]) => {
                res.setHeader(key, value);
            });
        }

        res.status(this.status).send(this.data);
    }
}