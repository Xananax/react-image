import { isString } from './isString'
import { isBlob } from './isBlob'
import { isFile } from './isFile'

export interface ImageContentFromString{
  src:string
}

export interface ImageContentFromFile{
  src:string
  alt:string
}

export interface ImageContentFromBlob{
  src:string
}

export type ImageContent = ImageContentFromBlob | ImageContentFromFile | ImageContentFromString

export interface LoadCallback{
  (err:null,res:ImageContentFromString):void
  (err:null,res:ImageContentFromFile):void
  (err:null,res:ImageContentFromBlob,done:()=>void):void
  (err:null,res:ImageContent,done?:()=>void):void
  (err:Error|DOMError):void
}

/**
 * This is a dumb function that essentially takes a string and assigns it to an object
 * of shape `{src:string}`. It exists only so the `loadAnything` function, which accepts
 * blobs, files, or strings, works with whatever it is given
 * @param src a string
 * @param cb   A callback to use when done. The Callback receives three arguments
 *  - err: An error object if `src` is empty, `null` otherwise
 *  - res: the resource object. It will have a `src` property
 */
export const loadString = 
  (src:string,cb:LoadCallback) =>
  ( src
  ? cb(null,{src} as ImageContentFromString)
  : cb(new Error(`src is empty`))
  )

/**
 * Creates a suitable data string to use from a dom File object
 * @param file a dom File object
 * @param cb   A callback to use when done. The Callback receives three arguments
 *  - err: An error object if there was an error, `null` otherwise
 *  - res: the resource object. It will have a `src` property, and an `alt` property containing the file name
 */
export const loadFile = 
  (file:File,cb:LoadCallback) => 
  { const reader = new FileReader()
  ; reader.onload = (evt:ProgressEvent) =>
    { cb( null,
      { src:reader.result
      , alt:file.name
      } as ImageContentFromFile)
    }
  ; reader.onerror = (evt:ErrorEvent) => cb(reader.error)
  ; reader.readAsDataURL(file);
  }

/**
 * Creates a data string from a blob, that you can use in an image.
 * Don't forget to call `done` once you've used it to free the memory
 * @param blob the blob
 * @param cb   A callback to use when done. The Callback receives three arguments
 *  - err: An error object if there was an error, `null` otherwise
 *  - res: the resource object. It will have a `src` property
 *  - done: an optional function used to free the resource; you need to call that after assigning the resource to an image
 */
export const loadBlob = 
  ( blob: Blob, cb: LoadCallback ) =>
  { try
    { const src = URL.createObjectURL( blob )
    ; const done = () => URL.revokeObjectURL( src )
    ; cb( null, { src } as ImageContentFromBlob, done );
    }
    catch( err )
    { return cb( err )
    }
  }

/**
 * Loads a Blob, or a File in a way that makes it suitable to be used in a node image
 * Does nothing to strings, but accepts them in order to make it easy to use this function everywhere
 * 
 * @param prop the src to load
 * @param cb   A callback to use when done. The Callback receives three arguments
 *  - err: An error object if there was an error, `null` otherwise
 *  - res: the resource object. It will have a `src` property, and possibly an `alt` property
 *  - done: an optional function used to free the resource; you need to call that after assigning the resource to an image
 */
export const loadAnything = ( prop: File | Blob | string, cb: LoadCallback ) =>
  ( isString( prop )
  ? loadString( prop, cb )
  : ( isBlob( prop )
    ? loadBlob( prop, cb )
    : ( isFile( prop )
      ? loadFile( prop, cb )
      : cb( new Error( `prop \`${prop}\` is not a valid loadable object` ) )
      )
    )
  )

export default loadAnything