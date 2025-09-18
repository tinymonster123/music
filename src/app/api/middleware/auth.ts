import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";

export interface ApiError {
	message: string;
	status: number;
	code?: string;
}

export class ApiErrorResponse extends Error {
	status: number;
	code?: string;

	constructor(message: string, status: number = 500, code?: string) {
		super(message);
		this.status = status;
		this.code = code;
	}
}

export const withAuth = async <T>(
	req: NextRequest,
	handler: (req: NextRequest, session: any) => Promise<T>,
): Promise<NextResponse> => {
	try {
		const session = await auth();

		if (!session?.user) {
			return NextResponse.json(
				{
					success: false,
					error: "未经授权的访问，请先登录",
					code: "UNAUTHORIZED",
				},
				{ status: 401 },
			);
		}

		const result = await handler(req, session);
		return NextResponse.json({
			success: true,
			data: result,
		});
	} catch (error) {
		console.error("API错误:", error);

		if (error instanceof ApiErrorResponse) {
			return NextResponse.json(
				{
					success: false,
					error: error.message,
					code: error.code,
				},
				{ status: error.status },
			);
		}

		return NextResponse.json(
			{
				success: false,
				error: "服务器内部错误",
				code: "INTERNAL_ERROR",
			},
			{ status: 500 },
		);
	}
};

export const withErrorHandling = async <T>(
	handler: () => Promise<T>,
): Promise<NextResponse> => {
	try {
		const result = await handler();
		return NextResponse.json({
			success: true,
			data: result,
		});
	} catch (error) {
		console.error("API错误:", error);

		if (error instanceof ApiErrorResponse) {
			return NextResponse.json(
				{
					success: false,
					error: error.message,
					code: error.code,
				},
				{ status: error.status },
			);
		}

		return NextResponse.json(
			{
				success: false,
				error: "服务器内部错误",
				code: "INTERNAL_ERROR",
			},
			{ status: 500 },
		);
	}
};
