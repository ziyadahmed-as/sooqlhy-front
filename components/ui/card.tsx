"use client";

import React from "react";
import Image from "next/image";
import { Button } from "./button";

export interface Product {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
}

export const Card: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
      <Image
        src={product.imageUrl}
        alt={product.title}
        width={400}
        height={300}
        className="object-cover w-full h-48"
      />
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-medium">{product.title}</h3>
        <p className="mt-2 text-primary font-semibold">${product.price.toFixed(2)}</p>
        <Button variant="primary" size="sm" className="mt-auto w-full">
          Add to Cart
        </Button>
      </div>
    </div>
  );
};
