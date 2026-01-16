"use client"

import * as React from "react"
import { Expand, X } from "lucide-react"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel"
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
// import Image from "next/image" // Assuming standard img for now to match project patter, but next/image is better. sticking to img for consistency with previous file.

interface ProductGalleryProps {
    images: string[]
    productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [current, setCurrent] = React.useState(0)
    const [api, setApi] = React.useState<CarouselApi>()
    const [mainApi, setMainApi] = React.useState<CarouselApi>()
    const [thumbApi, setThumbApi] = React.useState<CarouselApi>()

    // Sync card carousel with state
    React.useEffect(() => {
        if (!api) return

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap())
        })
    }, [api])

    // Sync lightbox main carousel with thumbnail carousel
    const onThumbClick = React.useCallback(
        (index: number) => {
            if (!mainApi || !thumbApi) return
            mainApi.scrollTo(index)
        },
        [mainApi, thumbApi]
    )

    const onSelect = React.useCallback(() => {
        if (!mainApi || !thumbApi) return
        const index = mainApi.selectedScrollSnap()
        thumbApi.scrollTo(index)
        setCurrent(index) // Update card current as well if needed, or just local state
    }, [mainApi, thumbApi])

    React.useEffect(() => {
        if (!mainApi) return
        mainApi.on("select", onSelect)
        mainApi.on("reInit", onSelect)
    }, [mainApi, onSelect])

    // If no images or empty array, handle gracefully (though parent should handle fallout)
    const displayImages = images.length > 0 ? images : ["/placeholder.svg"]

    return (
        <>
            {/* Card Carousel */}
            <div className="relative group w-full h-full bg-gray-100 overflow-hidden">
                <Carousel
                    setApi={setApi}
                    className="w-full h-full"
                    opts={{ loop: true }}
                >
                    <CarouselContent className="-ml-0 h-full">
                        {displayImages.map((src, index) => (
                            <CarouselItem key={index} className="pl-0 h-full relative">
                                <div
                                    className="w-full h-full cursor-pointer"
                                    onClick={() => setIsOpen(true)}
                                >
                                    <img
                                        src={src}
                                        alt={`${productName} view ${index + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                {/* Dark gradient overlay for text readability if we had text, but here just subtle depth */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    {/* Controls - Only show if > 1 image */}
                    {displayImages.length > 1 && (
                        <>
                            {/* Pagination Badge */}
                            <div className="absolute bottom-3 right-3 z-10">
                                <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-full shadow-sm pointer-events-none">
                                    {current + 1} / {displayImages.length}
                                </div>
                            </div>

                            {/* Navigation Arrows - Appear on Hover */}
                            <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <CarouselPrevious className="pointer-events-auto h-8 w-8 border-none bg-white/70 hover:bg-white text-black shadow-md backdrop-blur-sm transform hover:scale-110 transition-all" />
                                <CarouselNext className="pointer-events-auto h-8 w-8 border-none bg-white/70 hover:bg-white text-black shadow-md backdrop-blur-sm transform hover:scale-110 transition-all" />
                            </div>
                        </>
                    )}

                    {/* Expand Icon - Hint to user they can open it */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setIsOpen(true)
                            }}
                            className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors"
                        >
                            <Expand size={14} />
                        </button>
                    </div>
                </Carousel>
            </div>

            {/* Lightbox Dialog using standard Dialog but customized */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 bg-black/95 border-none shadow-2xl flex flex-col overflow-hidden outline-none">
                    {/* Header / Close */}
                    <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
                        <DialogTitle className="text-white font-medium text-lg drop-shadow-md">
                            {productName}
                        </DialogTitle>
                        <DialogClose className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2">
                            <X size={24} />
                            <span className="sr-only">Close</span>
                        </DialogClose>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center relative p-4 sm:p-12">
                        {/* Main Carousel */}
                        <Carousel
                            setApi={setMainApi}
                            className="w-full h-full flex items-center justify-center"
                            opts={{ loop: true, align: "center" }}
                        >
                            <CarouselContent className="-ml-4 flex items-center h-full">
                                {displayImages.map((src, index) => (
                                    <CarouselItem key={index} className="pl-4 basis-full flex items-center justify-center h-full">
                                        <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center">
                                            <img
                                                src={src}
                                                alt={`${productName} full view ${index + 1}`}
                                                className="max-w-full max-h-full object-contain drop-shadow-2xl"
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            {displayImages.length > 1 && (
                                <>
                                    <CarouselPrevious className="left-4 h-12 w-12 border-none bg-white/10 hover:bg-white/20 text-white hover:text-white" />
                                    <CarouselNext className="right-4 h-12 w-12 border-none bg-white/10 hover:bg-white/20 text-white hover:text-white" />
                                </>
                            )}
                        </Carousel>
                    </div>

                    {/* Thumbnails */}
                    {displayImages.length > 1 && (
                        <div className="h-20 sm:h-24 bg-black/40 border-t border-white/10 p-2 flex items-center justify-center">
                            <Carousel
                                setApi={setThumbApi}
                                opts={{
                                    align: "center",
                                    containScroll: "keepSnaps",
                                    dragFree: true,
                                }}
                                className="w-full max-w-lg"
                            >
                                <CarouselContent className="-ml-2">
                                    {displayImages.map((src, index) => (
                                        <CarouselItem key={index} className="pl-2 basis-1/5 sm:basis-1/6 md:basis-1/8 cursor-pointer select-none">
                                            <div
                                                className={cn(
                                                    "relative aspect-square rounded-md overflow-hidden border-2 transition-all",
                                                    current === index ? "border-white opacity-100 scale-105" : "border-transparent opacity-50 hover:opacity-80"
                                                )}
                                                onClick={() => onThumbClick(index)}
                                            >
                                                <img
                                                    src={src}
                                                    alt="thumbnail"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </Carousel>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
