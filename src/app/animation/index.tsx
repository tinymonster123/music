import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { addPropertyControls, ControlType, RenderTarget } from "framer";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useMemo } from "react";

/**
 * ANIMATOR
 *
 * @framerIntrinsicWidth 200
 * @framerIntrinsicHeight 200
 * @framerDisableUnlink
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
const Animator = (props) => {
  /* Properties */
  const {
    pathAnimation,
    from = 0,
    to = 100,
    animate,
    shouldLoop,
    loopOptions,
    slots = [],
    endCircle,
  } = props;

  /* State */
  const hasChildren = slots && slots.length > 0;

  /* Empty State */
  let customShape = (
    <div style={placeholderStyles}>
      <div style={emojiStyles}>??</div>
      <p style={titleStyles}>Connect to Graphic</p>
      <p style={subtitleStyles}>
        Animates single or joined paths on Web Pages only.
      </p>
    </div>
  );

  if (hasChildren) {
    /* Grab the SVG from the Graphic */
    const firstChild = getFirstChild(slots);
    const svgChild = firstChild?.props?.svg;
    const isSpring = pathAnimation.type === "spring";

    /* Shape transition properties */
    /* Dividing stiffness and damping by 1000 is a trick I got from Matt 
    which helps with pathLength animations, which otherwise are so fast 
    you never even see them happen in the preview. */
    const shapeTransition = {
      pathLength: {
        ...pathAnimation,
        repeat: shouldLoop ? Infinity : 0,
        repeatType: loopOptions,
        stiffness: isSpring
          ? pathAnimation.stiffness / 1000
          : pathAnimation.stiffness,
        damping: isSpring
          ? pathAnimation.damping / 1000
          : pathAnimation.damping,
      },
    };

    /* Add our own properties to the Path */
    const pathLength = useMotionValue(0);
    const opacity = useTransform(pathLength, [0, 0.025], [0, 1]);
    // console.log("from: ", from, "to: ", to);

    const shapeProps = {
      variants: {
        start: {
          pathLength: 0,
        },
        end: {
          pathLength: 1,
        },
      },
      transition: {
        pathLength: {
          duration: 2,
          ease: "easeInOut",
        },
      },
    };

    // const strokeDasharray = `${pathLength.get()}px ${1 - pathLength.get()}px`;

    /* Prevent animating or adjusting pathLength on the Canvas */
    const isCanvas = RenderTarget.current() === RenderTarget.canvas;

    /* Just render the full connected Graphic on Canvas, when connected */
    if (isCanvas) {
      customShape = firstChild;
    }

    // ...existing code...

    /* If on a web page */
    if (!isCanvas && svgChild) {
      /* Pass Attributes */
      // 婵烇絽娴傞崰妤呭极婵傚憡鍤旂€瑰嫭婢樼徊锟� path 闂佹眹鍔岀€氼參寮婚悢濂夊殨闊洢鍎崇粈澶愭煠閹冩Щ鐟滄澘娲獮宥夊焵椤掑嫬瀚夐柨鐕傛嫹 path 闂佺ǹ绻愰崯鎵矆閿燂拷
      const paths = svgChild.match(/<path[^>]*>/g) || [];
      const pathsData = paths.map((path) => {
        const attributes = path.match(/[\w-]+="[^"]*"/g) || [];
        let pathD, stroke, strokeWidth, strokeLinecap, strokeLinejoin;

        for (const element of attributes) {
          if (element.includes("d=")) {
            pathD = splitAndReplace(element);
          }
          if (element.includes("stroke=")) {
            stroke = splitAndReplace(element);
          }
          if (element.includes("stroke-width=")) {
            strokeWidth = splitAndReplace(element);
          }
          if (element.includes("stroke-linecap=")) {
            strokeLinecap = splitAndReplace(element);
          }
          if (element.includes("stroke-linejoin=")) {
            strokeLinejoin = splitAndReplace(element);
          }
        }

        return { pathD, stroke, strokeWidth, strokeLinecap, strokeLinejoin };
      });

      /* Grab viewbox */
      let svgViewbox;
      const viewboxPart = svgChild.split("viewBox=")[1] || "";
      if (viewboxPart) {
        svgViewbox = viewboxPart
          .split("preserveAspectRatio")[0]
          .replace(/&quot;/g, "")
          .replace(/["']/g, "")
          .replace(/\.000000/g, "")
          .trim();
      } else {
        svgViewbox = "0 0 681 130";
      }

      const processPathData = (pathsData) => {
        return pathsData.map((pathData, index) => ({
          pathD: pathData.pathD,
          index: index,
        }));
      };

      const processedPathData = useMemo(
        () => processPathData(pathsData),
        [pathsData]
      );

      customShape = (
        <motion.div
          initial={isCanvas || animate === false ? false : "start"}
          animate={isCanvas || animate === false ? false : "end"}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            placeContent: "center",
            placeItems: "center",
            backgroundColor: "transparent",
            overflow: "hidden",
          }}
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="681.0000pt"
            height="131.000pt"
            viewBox={svgViewbox}
          >
            <motion.g
              transform="translate(0.000000,130.000000) scale(0.100000,-0.100000)"
              fill="#ff0000"
              stroke="#ff0000"
            >
              {processedPathData.map((pathData, index) => (
                <motion.path
                  key={index}
                  {...shapeProps}
                  d={pathData.pathD}
                  stroke="#ff0000"
                  strokeWidth={pathData.strokeWidth}
                  strokeLinejoin={pathData.strokeLinejoin}
                  strokeLinecap={pathData.strokeLinecap}
                  fill="#ff0000"
                  initial={{
                    pathLength: 0,
                    fillOpacity: 0,
                  }}
                  animate={{
                    pathLength: 1,
                    fillOpacity: 1,
                  }}
                  transition={{
                    pathLength: {
                      duration: 2,
                      ease: "easeInOut",
                    },
                    fillOpacity: {
                      duration: 1,
                      delay: 1.5, // 在描边动画进行到75%时开始显示填充色
                    },
                  }}
                />
              ))}
            </motion.g>
          </motion.svg>
        </motion.div>
      );
    }
  }

  return customShape;
};

export default Animator;

/* Default Properties */
Animator.defaultProps = {
  animate: true,
  shouldLoop: false,
  loopOptions: "reverse",
  from: 0,
  to: 100,
  pathAnimation: {
    type: "tween",
    duration: 2,
  },
  endCircle: true,
};

/* Property Controls */
addPropertyControls(Animator, {
  slots: {
    type: ControlType.ComponentInstance,
    title: "Children",
  },
  animate: {
    title: "Animate",
    type: ControlType.Boolean,
    defaultValue: Animator.defaultProps.animate,
    enabledTitle: "True",
    disabledTitle: "False",
  },
  shouldLoop: {
    title: "Loop",
    type: ControlType.Boolean,
    defaultValue: Animator.defaultProps.shouldLoop,
    enabledTitle: "True",
    disabledTitle: "False",
    hidden(props) {
      return props.animate === false;
    },
  },
  loopOptions: {
    type: ControlType.Enum,
    title: "Type",
    defaultValue: Animator.defaultProps.loopOptions,
    options: ["loop", "reverse", "mirror"],
    optionTitles: ["Loop", "Reverse", "Mirror"],
    hidden(props) {
      return props.shouldLoop === false;
    },
  },
  endCircle: {
    title: "End Circle",
    type: ControlType.Boolean,
    defaultValue: Animator.defaultProps.endCircle,
    enabledTitle: "Show",
    disabledTitle: "Hide",
    hidden(props) {
      return props.animate === false;
    },
  },
  from: {
    title: "From",
    type: ControlType.Number,
    min: 0,
    max: 100,
    displayStepper: true,
    step: 1,
    defaultValue: Animator.defaultProps.from,
    unit: "%",
    hidden(props) {
      return props.animate === false;
    },
  },
  to: {
    title: "To",
    type: ControlType.Number,
    min: 0,
    max: 100,
    displayStepper: true,
    step: 1,
    defaultValue: Animator.defaultProps.to,
    unit: "%",
    hidden(props) {
      return props.animate === false;
    },
  },
  pathAnimation: {
    title: " ",
    type: ControlType.Transition,
    defaultValue: Animator.defaultProps.pathAnimation,
    hidden(props) {
      return props.animate === false;
    },
  },
});

/* Method to get stringless attributes */
const splitAndReplace = (string) => {
  // 闂侀潻璐熼崝宥夘敆濠靛绠ラ柟鎯у暱缁侇亪鎮峰▎娆戠ɑ闁诲簼绮欏畷姗€宕ㄩ褍鏅ｉ梺鎸庣☉閻ジ寮妶鍡欘洸閹兼番鍊楀▓鍫曟偣閸ラ攱瀚�
  // console.log("[splitAndReplace] raw:", string);
  const value = string.split("=")[1].replace(/['"]+/g, "");

  // 闂佸吋鐪归崕纾嬵暰闂佸搫顑嗛崝妤冨垝閵娾晛鍑犳繝濞惧亾缂佹顦靛浼搭敍濞戞瑦顔嶉梺绋匡功閵嗗妲愬┑瀣婵炲棙鍨靛楣冩煕濡厧鏋戦柣妤勯哺濞煎寮幐搴ｎ槬闂佹寧绋掔粙鎴﹀箚娓氣偓瀹曟艾鈻庨幒鏃傤唹闂佹悶鍎抽崑鐐哄汲閻旂厧纾归柨鐕傛嫹
  const num = parseFloat(value);
  if (isNaN(num)) {
    // console.warn("[splitAndReplace] Not a number:", value);
    return value; // 闂佺儵鏅涢悺銊ф暜鐎涙ɑ浜ら柡鍌涘缁€鈧柣搴㈢⊕椤ㄥ牓顢栨担鍦枖闁跨噦鎷�
  }
  return num; // 闁哄鏅滈弻銊ッ洪弽顓炴瀬闁哄绨遍崑鎾绘晸閿燂拷
};

/* Method to get the first child */
const getFirstChild = (slots) => {
  if (!slots || slots.length === 0) return null;
  return slots[0]; // 闂佺儵鏅涢悺銊ф暜鐎涙ɑ浜ら柡鍌涘缁€鈧紓浣诡殢閸忔稓绮╃€涙ḿ鈻旀い蹇撳鐢绱掓潏鈺侇€撶紒杈ㄧ箞瀵噣鎮╃紒妯圭帛婵炶揪缍€濞夋洟寮敓锟� React.Children
}

/* Styles */
const placeholderStyles = {
  display: "flex",
  width: "100%",
  height: "100%",
  placeContent: "center",
  placeItems: "center",
  flexDirection: "column",
  color: "#96F",
  background: "rgba(136, 85, 255, 0.1)",
  fontSize: 11,
  overflow: "hidden",
};

const emojiStyles = {
  fontSize: 32,
  marginBottom: 10,
};

const titleStyles = {
  margin: 0,
  marginBottom: 10,
  fontWeight: 600,
  textAlign: "center",
};

const subtitleStyles = {
  margin: 0,
  opacity: 0.7,
  maxWidth: 150,
  lineHeight: 1.5,
  textAlign: "center",
};

export const __FramerMetadata__ = {
  exports: {
    default: {
      type: "reactComponent",
      name: "Animator",
      slots: [],
      annotations: {
        framerIntrinsicHeight: "200",
        framerSupportedLayoutWidth: "fixed",
        framerSupportedLayoutHeight: "fixed",
        framerIntrinsicWidth: "200",
        framerContractVersion: "1",
        framerDisableUnlink: "*",
      },
    },
    __FramerMetadata__: {
      type: "variable",
    },
  },
};
